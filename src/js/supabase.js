import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
const cfg=window.__SATGOLD_CONFIG__||{};
export const configured=Boolean(cfg.url&&cfg.key);
export const supabase=configured?createClient(cfg.url,cfg.key):null;
