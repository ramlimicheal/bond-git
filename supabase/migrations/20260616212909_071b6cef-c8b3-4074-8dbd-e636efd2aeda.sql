
-- 1. Fix broken self-join in legal_messages policies
DROP POLICY IF EXISTS "Org + lawyer view case messages" ON public.legal_messages;
DROP POLICY IF EXISTS "Org + lawyer send messages" ON public.legal_messages;

CREATE POLICY "Org + lawyer view case messages"
ON public.legal_messages FOR SELECT
USING (
  is_org_member(org_id)
  OR EXISTS (
    SELECT 1 FROM lawyer_engagements e
    JOIN lawyers l ON l.id = e.lawyer_id
    WHERE e.case_id = legal_messages.case_id
      AND l.user_id = auth.uid()
  )
);

CREATE POLICY "Org + lawyer send messages"
ON public.legal_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND (
    is_org_member(org_id)
    OR EXISTS (
      SELECT 1 FROM lawyer_engagements e
      JOIN lawyers l ON l.id = e.lawyer_id
      WHERE e.case_id = legal_messages.case_id
        AND l.user_id = auth.uid()
    )
  )
);

-- 2. Pin search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END $function$;

-- 3. Revoke EXECUTE on SECURITY DEFINER helpers from anon/public; keep authenticated for RLS use
REVOKE EXECUTE ON FUNCTION public.org_role_of(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_write_org(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- Internal trigger functions: should not be callable by API roles at all
REVOKE EXECUTE ON FUNCTION public.add_org_creator_as_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
