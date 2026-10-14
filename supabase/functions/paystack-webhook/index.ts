import { createClient } from "npm:@supabase/supabase-js@2";
const hex=(b:ArrayBuffer)=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
const PERIOD_DAYS=Number(Deno.env.get("PERIOD_DAYS")??"90"); // ASSUMPTION: term length is a business rule, set PERIOD_DAYS secret
Deno.serve(async(req)=>{
 const raw=await req.text();
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(Deno.env.get("PAYSTACK_SECRET_KEY")!),{name:"HMAC",hash:"SHA-512"},false,["sign"]);
 const sig=hex(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw)));
 if(sig!==req.headers.get("x-paystack-signature"))return new Response("invalid signature",{status:401});
 const ev=JSON.parse(raw);
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SECRET_KEY")!);
 const eid=`${ev.event}:${ev.data?.id??ev.data?.reference}`;
 const ins=await admin.from("payment_webhook_events").insert({provider:"paystack",provider_event_id:eid,event_type:ev.event,payload:ev});
 if(ins.error)return new Response("duplicate",{status:200}); // unique (provider, provider_event_id)
 if(ev.event!=="charge.success")return new Response("ignored");
 const ref=ev.data.reference;
 const {data:pay}=await admin.from("school_payments").select("*").eq("provider","paystack").eq("provider_payment_id",ref).maybeSingle();
 if(!pay||pay.status==="succeeded")return new Response("nothing to do");
 const v=await (await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`,{headers:{Authorization:`Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`}})).json();
 const plan_code=v?.data?.metadata?.plan_code;
 const {data:plan}=await admin.from("subscription_plans").select("price_minor").eq("plan_code",plan_code??"").maybeSingle();
 if(!v.status||v.data.status!=="success"||v.data.currency!=="NGN"||v.data.amount!==pay.amount_minor||v.data.metadata?.school_id!==pay.school_id||plan?.price_minor!==pay.amount_minor){
  await admin.from("payment_webhook_events").update({processing_error:"verification mismatch"}).eq("provider","paystack").eq("provider_event_id",eid);return new Response("verification failed",{status:400});}
 const end=new Date(Date.now()+PERIOD_DAYS*864e5).toISOString();
 await admin.from("school_payments").update({status:"succeeded",paid_at:new Date().toISOString()}).eq("id",pay.id).neq("status","succeeded");
 await admin.from("school_subscriptions").update({plan:plan_code,status:"active",current_period_ends_at:end,provider:"paystack"}).eq("school_id",pay.school_id);
 await admin.from("payment_webhook_events").update({processed_at:new Date().toISOString()}).eq("provider","paystack").eq("provider_event_id",eid);
 return new Response("ok");
});
