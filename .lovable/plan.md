## Smoke Test Plan

Run an automated Playwright smoke test against the live preview to verify every sidebar route loads without errors and that quote/proposal creation actually persists to the database.

### Scope

**Routes to verify (load + no JS/console errors + key UI present):**
1. `/` Dashboard
2. `/sales` Sales Overview
3. `/sales/invoices` Invoices
4. `/sales/quotes` Quotes
5. `/sales/proposals` Proposals
6. `/legal/cases` Legal Cases
7. `/legal/lawyers` Lawyers
8. `/clients` Clients
9. `/products` Products
10. `/reports` Finance Reports
11. `/accounts` Accounts & Users
12. `/settings` Settings

**Create-flow regression (the user's main complaint):**
- Open `/sales/quotes` → click "New Quote" → fill client + 1 line item → Save → confirm row appears in list AND row exists in `quotes` table in Lovable Cloud.
- Same for `/sales/proposals` → "New Proposal".
- Capture screenshots and console/network errors at each failure point.

### How it runs

1. Pre-minted Supabase session is injected into `localStorage` so the authenticated routes load.
2. Playwright (headless Chromium, 1280x1800) navigates each route, screenshots, and collects `console.error` + failed network requests.
3. For quote/proposal flows: drive the form, submit, then query the `quotes` and `proposals` tables via `supabase--read_query` to confirm insert happened (or didn't — which would explain "nothing got created").
4. Produce a per-route pass/fail table with the first error per failing page.

### Deliverable

- Pass/fail matrix for all 12 routes.
- Root-cause diagnosis for the quote/proposal "nothing created" report (likely candidates I'll check: missing `org_id` on insert, RLS rejection from `can_write_org`, form validation silently failing, or `dataStore` mutation not awaited). **No fixes are applied in this turn** — once we know what's broken, I'll come back with a targeted fix plan.

### Out of scope

PDF rendering quality, email/Razorpay/lawyer-chat integrations, mobile viewport, and any code changes. This turn is diagnosis only.