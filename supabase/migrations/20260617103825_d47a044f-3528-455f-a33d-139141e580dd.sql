
-- 1. Fix legal_messages policies: restrict to authenticated role
DROP POLICY IF EXISTS "Org + lawyer send messages" ON public.legal_messages;
DROP POLICY IF EXISTS "Org + lawyer view case messages" ON public.legal_messages;

CREATE POLICY "Org + lawyer view case messages"
ON public.legal_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.legal_cases lc
    WHERE lc.id = legal_messages.case_id
      AND (
        public.is_org_member(lc.org_id)
        OR EXISTS (
          SELECT 1 FROM public.lawyer_engagements le
          JOIN public.lawyers l ON l.id = le.lawyer_id
          WHERE le.case_id = lc.id AND l.user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "Org + lawyer send messages"
ON public.legal_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.legal_cases lc
    WHERE lc.id = legal_messages.case_id
      AND (
        public.is_org_member(lc.org_id)
        OR EXISTS (
          SELECT 1 FROM public.lawyer_engagements le
          JOIN public.lawyers l ON l.id = le.lawyer_id
          WHERE le.case_id = lc.id AND l.user_id = auth.uid()
        )
      )
  )
);

-- 2. Prevent privilege escalation on organization_members
DROP POLICY IF EXISTS "Admins update memberships" ON public.organization_members;

CREATE POLICY "Admins update memberships"
ON public.organization_members
FOR UPDATE
TO authenticated
USING (public.is_org_admin(org_id))
WITH CHECK (
  public.is_org_admin(org_id)
  AND (
    role <> 'owner'
    OR public.org_role_of(org_id) = 'owner'
  )
);

-- 3. Restrict audit_log inserts to trusted server-side functions
DROP POLICY IF EXISTS "Members write audit log" ON public.audit_log;
REVOKE INSERT ON public.audit_log FROM authenticated;

CREATE OR REPLACE FUNCTION public.log_audit_event(
  _org_id uuid,
  _action text,
  _entity_type text DEFAULT NULL,
  _entity_id uuid DEFAULT NULL,
  _meta jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.is_org_member(_org_id) THEN
    RAISE EXCEPTION 'Not a member of this organization';
  END IF;

  INSERT INTO public.audit_log (org_id, actor_id, action, entity_type, entity_id, meta)
  VALUES (_org_id, auth.uid(), _action, _entity_type, _entity_id, _meta)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(uuid, text, text, uuid, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.log_audit_event(uuid, text, text, uuid, jsonb) TO authenticated;
