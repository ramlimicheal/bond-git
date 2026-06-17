# Billenty v1 — Shipped

All 7 planned items are now in code and deployed.

## Done
- **A1** Sales Overview wired to live `invoices`/`quotes`/`proposals` with tooltips, clickable rows, empty state.
- **A2** PDF generator sanitises ₹/curly quotes/em-dashes.
- **A3** Dark mode lifted to WCAG AA.
- **A4** Lawyers page + engagements + `legal_notices` table.
- **A5** Settings: notifications group, auto-notice toggle + N-days, "Run scan now" button, demo data loader in Integrations tab.
- **B1** Public landing at `/` (editorial dark, mint accent) + `/onboarding` (freelancer vs agency, state, GSTIN) + `/lawyer` portal.
- **B2** Indian GST defaults baked into invoice form: SAC 9983, 18%, intra-state CGST+SGST split vs inter-state IGST. Helper in `utils/gst.ts`.
- **B3** Legal layer end-to-end: per-invoice `LegalNoticesPanel` (manual draft) + scheduled scanner edge function `auto-notice-cron` that drafts notices for any overdue invoice with `auto_notice_enabled=true`. Lawyer portal at `/lawyer` shows attached invoices + draft + Mark sent.
- **B4** AI assist via shared `ai-assist` edge function (Gemini 3 Flash): `invoice-line` polish on each line item, `quote-scope` brief→scope on quote form, `proposal-agreement` JSON-structured 6-section draft on proposal form.
- **B5** Demo data: one-click "Load demo" button in Settings → Integrations inserts 3 clients, 1 lawyer, 3 invoices (paid / overdue+notice / draft), a quote, a signed proposal — all ₹ + 18% GST.

## How the scheduler is wired
`auto-notice-cron` is deployed but **not yet on pg_cron**. Users can hit it manually from Settings → Notifications → "Run scan". To run daily, add this SQL (replace ANON_KEY):
```sql
select cron.schedule(
  'billenty-auto-notice-daily', '0 9 * * *',
  $$ select net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/auto-notice-cron',
    headers := '{"Content-Type":"application/json","apikey":"<ANON_KEY>"}'::jsonb,
    body := '{}'::jsonb) $$);
```

## What's deliberately deferred
- Razorpay / Stripe / WhatsApp send → "Coming Soon" in Integrations.
- E-invoice IRP filing.
- Actual lawyer invite-by-email — for now a lawyer signs up themselves, you add their email under Legal → Lawyers, and they see invoices at `/lawyer`.
