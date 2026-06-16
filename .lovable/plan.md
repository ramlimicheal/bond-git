## Goal

Fix the three concrete pain points first (PDF, dark mode contrast, Lawyers mock data), then sweep every page in a structured audit and fix what's broken in priority order.

## Phase 0 — Reproduce & inventory (1 pass, no edits)

- Drive Playwright through every sidebar route while signed in. Capture screenshots + console/network for each.
- For each page, log: dead `onClick`s, forms that don't submit, sections rendering hardcoded arrays, dark-mode contrast failures.
- Output: a single triage table (Critical / High / Medium / Low) that drives the rest of the work.

## Phase 1 — Critical fixes (the three you named)

**1. PDF generation does nothing on click**
- Likely cause: handler imports `utils/pdfGenerator.ts` but the button is wired to a stub, or `downloadBlob` is never called, or an unawaited promise swallows the error. Will confirm in repro.
- Fix: wire `generateInvoicePDF` / `generateQuotePDF` / `generateProposalPDF` to the Download buttons in `InvoiceDetailsPage`, `QuoteDetailsPage`, `ProposalDetailsPage`. Load org branding from `organizations` row. Wrap in try/catch with sonner toast for success + error. Add loading state on the button.
- Verify in Playwright: click Download → file downloads → open the PDF bytes and confirm non-empty + valid header.

**2. Dark mode low-contrast text**
- Audit `src/styles.css` `.dark` tokens against actual usage. Replace any hardcoded `text-gray-*`, `text-white`, `text-black`, `bg-white` in components with semantic tokens (`text-foreground`, `text-muted-foreground`, `bg-card`, `bg-background`).
- Bump `--muted-foreground` in dark mode to meet WCAG AA against `--background` and `--card`.
- Re-screenshot every page in dark mode after the pass.

**3. Lawyers page is mock**
- Replace local array with real queries against existing `lawyers` and `lawyer_engagements` tables (already in schema).
- Add: New Lawyer dialog (name, firm, bar number, specialization, email, phone, hourly rate), edit, delete (with confirm), search.
- Engagements section per lawyer: list cases they're engaged on, "Assign to Case" dialog pulling from `legal_cases`, end-engagement action.
- Wire to `useOrg()` for tenant scoping. RLS policies already exist.

## Phase 2 — Systematic audit & fix (priority-ordered, NOT page-by-page rewrites)

Walk the triage table from Phase 0 and fix in this order. I will only touch what is actually broken — no speculative rewrites of working code.

**Critical tier**
- Dead buttons (empty `onClick={() => {}}`) → implement or remove.
- Forms that don't persist (CreateInvoice / CreateQuote / CreateProposal / Clients / Products / Settings) → confirm each maps to a Supabase insert/update via the existing `useTable` hooks; fix the ones that don't.
- Broken navigation links in Sidebar / CommandPalette.
- Any uncaught console errors.

**High tier**
- Missing zod validation on user-facing forms (clients, products, lawyers, settings org profile).
- Missing loading states on async actions → standard pattern: disabled button + spinner.
- Missing empty states on list pages → use existing `EmptyState` component.
- Missing error toasts on failed mutations.

**Medium tier**
- Inconsistent date formatting → centralize via existing `fmtDate` helper.
- Misaligned cards / overflow on mobile (viewport check at 375px).
- A11y: icon-only buttons missing `aria-label`, images missing `alt`.

**Low tier (only if time)**
- Duplicate components (e.g. `CreateInvoiceModal` vs `CreateInvoicePage`, `InvoiceDetailModal` vs `InvoiceDetailsPage`) — flag for removal, don't delete without confirmation.

## Phase 3 — Verification

- Playwright pass #2: every route loads, every primary action (create invoice, create quote, create proposal, add client, add product, add lawyer, assign lawyer, download PDF) executes end-to-end against the real DB.
- Visual pass: dark mode screenshots of all 12 pages, side-by-side check for unreadable text.
- Console: zero errors, zero red network responses on the happy path.

## Deliverable

A single report at the end, formatted as the user requested:
- Executive summary (counts by severity)
- Per-issue: location, root cause, fix
- Files changed list
- Verified-working checklist
- Any deferred items with reason

## Scope boundaries (so this stays tractable)

- I will NOT rewrite components that already work, even if I'd structure them differently.
- I will NOT touch auth flows, RLS policies, or the Supabase integration files unless a bug forces it.
- The legacy `server/` Prisma directory is unused on Lovable Cloud — I'll flag it but not delete.
- If Phase 0 surfaces >30 critical+high issues, I'll pause and confirm before continuing rather than burning credits silently.

## Technical notes

- PDF stack stays on `pdf-lib` (already installed, works in browser). I won't switch to `jsPDF`/`html2canvas` — the existing `pdfGenerator.ts` template is solid; the bug is in wiring, not the generator.
- Lawyers CRUD will use the same `useTable` hook pattern other pages use, so it picks up `org_id` scoping automatically.
- Dark mode fixes go in `src/styles.css` `@theme` tokens + targeted component className swaps; no Tailwind config changes (v4 is CSS-first).
