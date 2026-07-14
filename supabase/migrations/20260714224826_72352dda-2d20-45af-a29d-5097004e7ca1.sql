
-- Break invoices <-> lawyers policy recursion.
-- lawyers "Org members view invoice-attached lawyers" selects from invoices,
-- and invoices "attached lawyer can read attached invoices" selects from lawyers.
-- Replace both with SECURITY DEFINER helpers that bypass RLS.

CREATE OR REPLACE FUNCTION public.is_lawyer_of(_lawyer_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.lawyers WHERE id = _lawyer_id AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.lawyer_is_attached_to_org_invoice(_lawyer_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.invoices i
    WHERE i.attached_lawyer_id = _lawyer_id AND public.is_org_member(i.org_id)
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_lawyer_of(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.lawyer_is_attached_to_org_invoice(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_lawyer_of(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lawyer_is_attached_to_org_invoice(uuid) TO authenticated;

DROP POLICY IF EXISTS "attached lawyer can read attached invoices" ON public.invoices;
CREATE POLICY "attached lawyer can read attached invoices" ON public.invoices
FOR SELECT TO authenticated
USING (attached_lawyer_id IS NOT NULL AND public.is_lawyer_of(attached_lawyer_id));

DROP POLICY IF EXISTS "Org members view invoice-attached lawyers" ON public.lawyers;
CREATE POLICY "Org members view invoice-attached lawyers" ON public.lawyers
FOR SELECT TO authenticated
USING (public.lawyer_is_attached_to_org_invoice(id));
