import { supabase } from "/src/js/supabase.js";
export const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const naira=k=>"\u20a6"+(k/100).toLocaleString("en-NG");
export async function requireSession(){ if(!supabase){location.href="/src/pages/login.html";return null;}
 const {data:{session}}=await supabase.auth.getSession(); if(!session){location.href="/src/pages/login.html";return null;} return session; }
