
-- 1. Organizations: org type + Indian GST defaults + notice automation + notifications
DO $$ BEGIN
  CREATE TYPE public.org_type AS ENUM ('freelancer','agency');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS type public.org_type NOT NULL DEFAULT 'freelancer',
  ADD COLUMN IF NOT EXISTS seat_limit int NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS default_state_code text,
  ADD COLUMN IF NOT EXISTS default_sac text NOT NULL DEFAULT '9983',
  ADD COLUMN IF NOT EXISTS default_tax_rate numeric NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS auto_notice_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_notice_days int NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS notifications jsonb NOT NULL DEFAULT '{"email":{"sent":true,"viewed":true,"paid":true,"overdue":true},"whatsapp":{"sent":false,"viewed":false,"paid":false,"overdue":false}}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;

-- 2. Invoices: attached lawyer + place of supply
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS attached_lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS place_of_supply_state text,
  ADD COLUMN IF NOT EXISTS is_interstate boolean NOT NULL DEFAULT false;

-- 3. Legal notices
DO $$ BEGIN
  CREATE TYPE public.legal_notice_status AS ENUM ('draft','sent','acknowledged','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.legal_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL,
  status public.legal_notice_status NOT NULL DEFAULT 'draft',
  subject text NOT NULL DEFAULT 'Demand notice',
  ai_draft text NOT NULL DEFAULT '',
  notes text,
  sent_at timestamptz,
  acknowledged_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_notices TO authenticated;
GRANT ALL ON public.legal_notices TO service_role;

ALTER TABLE public.legal_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org members can read their legal notices"
  ON public.legal_notices FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));

CREATE POLICY "org writers can insert legal notices"
  ON public.legal_notices FOR INSERT TO authenticated
  WITH CHECK (public.can_write_org(org_id));

CREATE POLICY "org writers can update legal notices"
  ON public.legal_notices FOR UPDATE TO authenticated
  USING (public.can_write_org(org_id))
  WITH CHECK (public.can_write_org(org_id));

CREATE POLICY "org admins can delete legal notices"
  ON public.legal_notices FOR DELETE TO authenticated
  USING (public.is_org_admin(org_id));

-- Attached lawyer (linked via lawyers.user_id) can read their own notices and update status
CREATE POLICY "attached lawyer can read their notices"
  ON public.legal_notices FOR SELECT TO authenticated
  USING (
    lawyer_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = legal_notices.lawyer_id AND l.user_id = auth.uid())
  );

CREATE POLICY "attached lawyer can update their notice status"
  ON public.legal_notices FOR UPDATE TO authenticated
  USING (
    lawyer_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = legal_notices.lawyer_id AND l.user_id = auth.uid())
  )
  WITH CHECK (
    lawyer_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = legal_notices.lawyer_id AND l.user_id = auth.uid())
  );

CREATE TRIGGER trg_legal_notices_updated_at
  BEFORE UPDATE ON public.legal_notices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS legal_notices_org_idx ON public.legal_notices(org_id);
CREATE INDEX IF NOT EXISTS legal_notices_invoice_idx ON public.legal_notices(invoice_id);
CREATE INDEX IF NOT EXISTS legal_notices_lawyer_idx ON public.legal_notices(lawyer_id);

-- Allow attached lawyer to read the invoices they are attached to (read-only)
CREATE POLICY "attached lawyer can read attached invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING (
    attached_lawyer_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = invoices.attached_lawyer_id AND l.user_id = auth.uid())
  );
