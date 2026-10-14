# SatGold Cloud (starter, Milestone 1 and part of 2)

## What is here
Public pages (home, pricing, features, contact, login, register placeholder), design tokens, Supabase client, core SQL migration with RLS, Paystack initialize and webhook Edge Functions, role portal placeholders.

## Milestone 2 addition
Registration wizard (`register.html`), atomic `register_school()` in `0002_onboarding.sql` (school, owner membership, session, terms, classes, subjects, grading scale, trial, audit log), owner dashboard with setup checklist, trial countdown, payment button and history. Run migrations 0001 then 0002. In Supabase Auth settings keep "Confirm email" on and add your site URL to redirect URLs.

## What is NOT built yet
Staff and student provisioning, remaining portal screens, CBT, results, report card PDFs, Gemini and Resend functions, Super Admin screens, legal pages, sitemap, automated tests. Nothing here has been run against Supabase, Paystack or Vercel.

## Database
The Supabase project `SatGold Cloud` (ref kykubgufjrmylfdoykgc) already contained the core schema (schools, school_memberships, RLS, `provision_school_owner` trigger, assessments, results and more). The only change applied now is `supabase/migrations/20261014_pricing_per_term_and_contact_submissions.sql`: per term billing interval, Starter 2300000 kobo, Growth 5000000 kobo, Custom (enterprise) contact only, and a `contact_submissions` table with RLS. Do not run any other SQL from older zips.

## Registration flow
The wizard signs up with `registration` metadata. The live trigger creates the school, owner membership, classes, subjects, academic settings and the two month trial when the owner confirms their email.

## Setup
1. Put the project URL and publishable key in `config.js`.
2. Supabase Auth: keep Confirm email on, set Site URL and redirect URLs to your domain.
3. Deploy functions: `supabase functions deploy paystack-initialize paystack-webhook`.
4. Secrets: `supabase secrets set PAYSTACK_SECRET_KEY=... SUPABASE_SECRET_KEY=... APP_BASE_URL=... PERIOD_DAYS=90`.
5. Paystack dashboard: webhook URL = the paystack-webhook function URL. Test keys first.
6. First Super Admin: add your user id to `platform_admins` in the SQL editor.
7. Deploy to Vercel and connect satgoldcloud.name.ng.

## Money
Amounts are in kobo (`price_minor`, `amount_minor`).

## Known gaps to decide
Term length (PERIOD_DAYS is an assumption), final Growth plan name, refund terms.
