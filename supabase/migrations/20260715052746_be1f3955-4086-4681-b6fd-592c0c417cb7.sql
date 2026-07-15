
-- Bootstrap: promotes current user to platform admin ONLY if no admins yet.
CREATE OR REPLACE FUNCTION public.bootstrap_first_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.platform_admins) THEN
    RETURN false;
  END IF;
  INSERT INTO public.platform_admins (user_id, role, created_at)
  VALUES (_uid, 'superadmin', now())
  ON CONFLICT DO NOTHING;
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.bootstrap_first_platform_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_platform_admin() TO authenticated;

-- Directory of all orgs for the super-admin console.
CREATE OR REPLACE FUNCTION public.admin_list_orgs()
RETURNS TABLE (
  org_id uuid,
  org_name text,
  created_at timestamptz,
  plan_code text,
  plan_name text,
  subscription_status text,
  current_period_end timestamptz,
  member_count integer,
  invoice_count integer,
  quote_count integer,
  proposal_count integer,
  monthly_price_inr numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.created_at,
    p.code,
    p.name,
    s.status,
    s.current_period_end,
    (SELECT count(*)::int FROM public.organization_members m WHERE m.org_id = o.id),
    (SELECT count(*)::int FROM public.invoices i WHERE i.org_id = o.id),
    (SELECT count(*)::int FROM public.quotes q WHERE q.org_id = o.id),
    (SELECT count(*)::int FROM public.proposals pr WHERE pr.org_id = o.id),
    COALESCE(p.price_inr, 0)
  FROM public.organizations o
  LEFT JOIN public.org_subscriptions s ON s.org_id = o.id
  LEFT JOIN public.plans p ON p.id = s.plan_id
  ORDER BY o.created_at DESC;
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_list_orgs() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_orgs() TO authenticated;

-- MRR summary: total active MRR + breakdown by plan.
CREATE OR REPLACE FUNCTION public.admin_mrr_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total numeric := 0;
  _by_plan jsonb;
  _active_orgs int := 0;
  _trialing int := 0;
  _paying int := 0;
  _total_orgs int := 0;
BEGIN
  IF NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO _total_orgs FROM public.organizations;
  SELECT count(*) INTO _active_orgs FROM public.org_subscriptions WHERE status IN ('active','trialing');
  SELECT count(*) INTO _trialing FROM public.org_subscriptions WHERE status = 'trialing';
  SELECT count(*) INTO _paying FROM public.org_subscriptions WHERE status = 'active';

  SELECT COALESCE(SUM(COALESCE(p.price_inr,0)), 0)
    INTO _total
    FROM public.org_subscriptions s
    JOIN public.plans p ON p.id = s.plan_id
   WHERE s.status = 'active';

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb) INTO _by_plan FROM (
    SELECT
      p.code,
      p.name,
      p.price_inr,
      count(s.id) FILTER (WHERE s.status='active')::int   AS active_count,
      count(s.id) FILTER (WHERE s.status='trialing')::int AS trialing_count,
      (count(s.id) FILTER (WHERE s.status='active') * COALESCE(p.price_inr,0))::numeric AS mrr_inr
    FROM public.plans p
    LEFT JOIN public.org_subscriptions s ON s.plan_id = p.id
    GROUP BY p.id, p.code, p.name, p.price_inr
    ORDER BY p.price_inr NULLS FIRST
  ) t;

  RETURN jsonb_build_object(
    'mrr_inr', _total,
    'arr_inr', _total * 12,
    'total_orgs', _total_orgs,
    'active_subscriptions', _active_orgs,
    'trialing', _trialing,
    'paying', _paying,
    'by_plan', _by_plan
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_mrr_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_mrr_summary() TO authenticated;
