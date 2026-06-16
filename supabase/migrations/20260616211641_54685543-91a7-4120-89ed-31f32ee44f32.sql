DROP POLICY IF EXISTS "Members view their orgs" ON public.organizations;
CREATE POLICY "Members or creator view org"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (is_org_member(id) OR created_by = auth.uid());