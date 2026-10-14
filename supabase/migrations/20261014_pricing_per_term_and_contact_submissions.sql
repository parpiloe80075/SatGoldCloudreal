-- APPLIED to project kykubgufjrmylfdoykgc on 2026-10-14. The live project already had the core schema
-- (schools, school_memberships, RLS, provision_school_owner trigger, etc.), so this is the only change made.
alter table public.subscription_plans drop constraint if exists subscription_plans_billing_interval_check;
alter table public.subscription_plans add constraint subscription_plans_billing_interval_check
  check (billing_interval = any (array['month','year','term','trial']));
update public.subscription_plans set billing_interval='term', price_minor=2300000 where plan_code='starter';
update public.subscription_plans set billing_interval='term', price_minor=5000000 where plan_code='growth';
update public.subscription_plans set name='Custom', billing_interval='term', price_minor=null where plan_code='enterprise';
create table if not exists public.contact_submissions(id uuid primary key default gen_random_uuid(),
 name text not null check(char_length(name) between 1 and 120),
 email text not null check(email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email)<=254),
 message text not null check(char_length(message) between 10 and 2000),
 status text not null default 'new' check(status in('new','read','replied','closed')),created_at timestamptz not null default now());
alter table public.contact_submissions enable row level security;
create policy "anyone can submit contact form" on public.contact_submissions for insert to anon,authenticated with check(status='new');
create policy "platform admins read contact submissions" on public.contact_submissions for select to authenticated using(public.is_platform_admin());
create policy "platform admins update contact submissions" on public.contact_submissions for update to authenticated using(public.is_platform_admin()) with check(public.is_platform_admin());
revoke all on public.contact_submissions from anon,authenticated;
grant insert on public.contact_submissions to anon,authenticated; grant select,update on public.contact_submissions to authenticated;
