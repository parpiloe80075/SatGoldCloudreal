import { createClient } from "npm:@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":Deno.env.get("APP_BASE_URL")??"","Access-Control-Allow-Headers":"authorization, content-type, apikey, x-client-info"};
const J=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SECRET_KEY")!);
 const {data:{user}}=await admin.auth.getUser((req.headers.get("authorization")??"").replace("Bearer ",""));
 if(!user)return J({error:"Unauthorized"},401);
 const {school_id,plan_code}=await req.json();
 const {data:m}=await admin.from("school_memberships").select("id").eq("school_id",school_id).eq("user_id",user.id).eq("role","owner").eq("status","active").maybeSingle();
 if(!m)return J({error:"Forbidden"},403);
 const {data:plan}=await admin.from("subscription_plans").select("price_minor").eq("plan_code",plan_code).eq("is_active",true).in("plan_code",["starter","growth"]).maybeSingle();
 if(!plan?.price_minor)return J({error:"Plan not payable online"},400);
 const reference=`SGC_${crypto.randomUUID().replaceAll("-","")}`;
 const ins=await admin.from("school_payments").insert({school_id,provider:"paystack",provider_payment_id:reference,amount_minor:plan.price_minor,currency:"NGN",status:"pending"});
 if(ins.error)return J({error:"Could not record payment"},500);
 const r=await fetch("https://api.paystack.co/transaction/initialize",{method:"POST",headers:{Authorization:`Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,"Content-Type":"application/json"},
  body:JSON.stringify({email:user.email,amount:plan.price_minor,currency:"NGN",reference,metadata:{school_id,plan_code},callback_url:`${Deno.env.get("APP_BASE_URL")}/src/portals/owner/index.html`})});
 const j=await r.json();
 if(!j.status)return J({error:"Payment provider error"},502);
 return J({authorization_url:j.data.authorization_url,reference});
});
