-- 1) Fix organization_members privilege-escalation: block admins from touching owner rows.
DROP POLICY IF EXISTS "Admins update memberships" ON public.organization_members;
CREATE POLICY "Admins update memberships"
  ON public.organization_members
  FOR UPDATE
  USING (
    public.is_org_admin(org_id)
    AND (role <> 'owner'::org_role OR public.org_role_of(org_id) = 'owner'::org_role)
  )
  WITH CHECK (
    public.is_org_admin(org_id)
    AND (role <> 'owner'::org_role OR public.org_role_of(org_id) = 'owner'::org_role)
  );

-- Also tighten DELETE so non-owner admins cannot delete owner rows.
DROP POLICY IF EXISTS "Admins delete memberships" ON public.organization_members;
CREATE POLICY "Admins delete memberships"
  ON public.organization_members
  FOR DELETE
  USING (
    public.is_org_admin(org_id)
    AND (role <> 'owner'::org_role OR public.org_role_of(org_id) = 'owner'::org_role)
  );

-- 2) Lawyers contact exposure: drop the broad policy, replace with narrow ones.
DROP POLICY IF EXISTS "Anyone authed views verified lawyers" ON public.lawyers;

-- Lawyer can always view their own row.
CREATE POLICY "Lawyer views own row"
  ON public.lawyers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Org members can view full lawyer record if their org has any engagement with that lawyer.
CREATE POLICY "Org members view engaged lawyers"
  ON public.lawyers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_engagements e
      WHERE e.lawyer_id = lawyers.id AND public.is_org_member(e.org_id)
    )
  );

-- Org members can view full lawyer record if any of their org's invoices attach that lawyer.
CREATE POLICY "Org members view invoice-attached lawyers"
  ON public.lawyers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.attached_lawyer_id = lawyers.id AND public.is_org_member(i.org_id)
    )
  );

-- 3) Public marketplace view: safe columns only (no email/phone).
CREATE OR REPLACE VIEW public.public_lawyers
WITH (security_invoker = true) AS
SELECT
  id, full_name, bar_council_no, states, specialties,
  rate_per_hour, bio, verified, active, created_at
FROM public.lawyers
WHERE active = true AND verified = true;

-- Allow any authenticated user to browse the safe view.
-- Underlying RLS doesn't grant them the full row (email/phone), but the view
-- only selects safe columns. We expose it through a SECURITY DEFINER set-returning
-- function so authenticated users can browse the marketplace without needing a
-- broad RLS grant on the base table.
CREATE OR REPLACE FUNCTION public.list_marketplace_lawyers()
RETURNS TABLE (
  id uuid, full_name text, bar_council_no text,
  states text[], specialties text[], rate_per_hour numeric,
  bio text, verified boolean, active boolean, created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, full_name, bar_council_no, states, specialties,
         rate_per_hour, bio, verified, active, created_at
  FROM public.lawyers
  WHERE active = true AND verified = true
$$;

REVOKE ALL ON FUNCTION public.list_marketplace_lawyers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_marketplace_lawyers() TO authenticated;
GRANT SELECT ON public.public_lawyers TO authenticated;