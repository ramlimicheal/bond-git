
-- =========================================================
-- CHUNK 1: PLATFORM BONES
-- =========================================================

-- ---------- platform_admins ----------
CREATE TYPE public.platform_admin_role AS ENUM ('super_admin','support','lawyer_ops');

CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.platform_admin_role NOT NULL DEFAULT 'support',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- security-definer helper (avoid recursive RLS)
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user_id)
$$;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;

CREATE POLICY "platform admins visible to admins" ON public.platform_admins
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

-- ---------- plans ----------
CREATE TABLE public.plans (
  code text PRIMARY KEY,
  name text NOT NULL,
  price_inr_monthly numeric NOT NULL DEFAULT 0,
  price_inr_yearly  numeric NOT NULL DEFAULT 0,
  seat_price_inr    numeric NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  limits   jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon, authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans readable to all" ON public.plans FOR SELECT USING (active OR public.is_platform_admin(auth.uid()));
CREATE POLICY "plans writable by platform admins" ON public.plans FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.plans (code, name, price_inr_monthly, price_inr_yearly, seat_price_inr, features, limits, sort_order) VALUES
 ('trial',   'Trial',   0,     0,      0,    '{"ai_assist":true,"legal_notices":true,"lawyer_marketplace":true}'::jsonb,
   '{"invoices":10,"quotes":10,"proposals":5,"notices_sent":1,"seats":1,"ai_tokens":50000,"lawyer_cases":0}'::jsonb, 0),
 ('starter', 'Starter', 499,   4990,   499,  '{"ai_assist":true,"legal_notices":true,"lawyer_marketplace":true,"client_portal":true}'::jsonb,
   '{"invoices":50,"quotes":50,"proposals":25,"notices_sent":3,"seats":1,"ai_tokens":250000,"lawyer_cases":1}'::jsonb, 1),
 ('pro',     'Pro',     999,   9990,   999,  '{"ai_assist":true,"legal_notices":true,"lawyer_marketplace":true,"client_portal":true,"recurring":true,"api":true}'::jsonb,
   '{"invoices":500,"quotes":500,"proposals":250,"notices_sent":15,"seats":5,"ai_tokens":1500000,"lawyer_cases":5}'::jsonb, 2),
 ('agency',  'Agency',  2499,  24990,  2499, '{"ai_assist":true,"legal_notices":true,"lawyer_marketplace":true,"client_portal":true,"recurring":true,"api":true,"white_label":true,"priority_support":true}'::jsonb,
   '{"invoices":-1,"quotes":-1,"proposals":-1,"notices_sent":-1,"seats":25,"ai_tokens":10000000,"lawyer_cases":-1}'::jsonb, 3);
-- limit value -1 = unlimited

-- ---------- org_subscriptions ----------
CREATE TYPE public.subscription_status AS ENUM ('trialing','active','past_due','canceled','paused');

CREATE TABLE public.org_subscriptions (
  org_id uuid PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_code text NOT NULL REFERENCES public.plans(code),
  seats int NOT NULL DEFAULT 1 CHECK (seats > 0),
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  razorpay_customer_id text,
  razorpay_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.org_subscriptions TO authenticated;
GRANT ALL ON public.org_subscriptions TO service_role;
ALTER TABLE public.org_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read subscription" ON public.org_subscriptions
  FOR SELECT TO authenticated USING (public.is_org_member(org_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "owners update subscription cancel flag" ON public.org_subscriptions
  FOR UPDATE TO authenticated USING (public.is_org_admin(org_id)) WITH CHECK (public.is_org_admin(org_id));
CREATE POLICY "platform admins manage subscription" ON public.org_subscriptions
  FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE TRIGGER trg_org_subs_updated BEFORE UPDATE ON public.org_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger to auto-create trial subscription when an org is created
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.org_subscriptions (org_id, plan_code, seats, status, trial_ends_at, current_period_start, current_period_end)
  VALUES (NEW.id, 'trial', 1, 'trialing', now() + interval '14 days', now(), now() + interval '14 days')
  ON CONFLICT (org_id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_org_trial_sub AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_trial_subscription();

-- Backfill existing orgs
INSERT INTO public.org_subscriptions (org_id, plan_code, seats, status, trial_ends_at, current_period_start, current_period_end)
SELECT id, 'trial', 1, 'trialing', now() + interval '14 days', now(), now() + interval '14 days'
FROM public.organizations
ON CONFLICT (org_id) DO NOTHING;

-- ---------- usage_meters ----------
CREATE TABLE public.usage_meters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  meter text NOT NULL,
  period_month date NOT NULL,  -- first day of month
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, meter, period_month)
);
GRANT SELECT ON public.usage_meters TO authenticated;
GRANT ALL ON public.usage_meters TO service_role;
ALTER TABLE public.usage_meters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read usage" ON public.usage_meters
  FOR SELECT TO authenticated USING (public.is_org_member(org_id) OR public.is_platform_admin(auth.uid()));
CREATE INDEX idx_usage_meters_org_period ON public.usage_meters (org_id, period_month);

-- Helpers
CREATE OR REPLACE FUNCTION public.increment_usage_meter(_org_id uuid, _meter text, _delta int DEFAULT 1)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new bigint;
BEGIN
  IF NOT public.is_org_member(_org_id) AND NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorised';
  END IF;
  INSERT INTO public.usage_meters (org_id, meter, period_month, count)
  VALUES (_org_id, _meter, date_trunc('month', now())::date, GREATEST(_delta,0))
  ON CONFLICT (org_id, meter, period_month)
  DO UPDATE SET count = public.usage_meters.count + _delta, updated_at = now()
  RETURNING count INTO _new;
  RETURN _new;
END $$;
REVOKE EXECUTE ON FUNCTION public.increment_usage_meter(uuid,text,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_usage_meter(uuid,text,int) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.check_entitlement(_org_id uuid, _feature text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _plan text; _limits jsonb; _limit bigint; _used bigint;
BEGIN
  IF NOT public.is_org_member(_org_id) AND NOT public.is_platform_admin(auth.uid()) THEN
    RETURN jsonb_build_object('allowed', false, 'reason','forbidden');
  END IF;
  SELECT s.plan_code, p.limits INTO _plan, _limits
  FROM public.org_subscriptions s JOIN public.plans p ON p.code = s.plan_code
  WHERE s.org_id = _org_id;
  IF _plan IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason','no_subscription');
  END IF;
  _limit := COALESCE((_limits->>_feature)::bigint, 0);
  IF _limit = -1 THEN
    RETURN jsonb_build_object('allowed', true, 'unlimited', true, 'plan', _plan);
  END IF;
  SELECT COALESCE(count,0) INTO _used FROM public.usage_meters
    WHERE org_id = _org_id AND meter = _feature AND period_month = date_trunc('month', now())::date;
  RETURN jsonb_build_object(
    'allowed', _used < _limit,
    'used', COALESCE(_used,0),
    'limit', _limit,
    'remaining', GREATEST(_limit - COALESCE(_used,0), 0),
    'plan', _plan
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.check_entitlement(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_entitlement(uuid,text) TO authenticated, service_role;

-- ---------- feature_flags ----------
CREATE TABLE public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  flag text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, flag)
);
GRANT SELECT ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org read flags" ON public.feature_flags
  FOR SELECT TO authenticated USING (org_id IS NULL OR public.is_org_member(org_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "platform admins manage flags" ON public.feature_flags
  FOR ALL TO authenticated USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

-- ---------- activity_log_v2 (universal event log) ----------
CREATE TABLE public.activity_log_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  actor_id uuid,
  actor_type text NOT NULL DEFAULT 'user',  -- user | platform_admin | platform_admin_as_org | client | lawyer | system
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  meta jsonb,
  ip inet,
  at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activity_log_v2 TO authenticated;
GRANT ALL ON public.activity_log_v2 TO service_role;
ALTER TABLE public.activity_log_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity readable to org members and admins" ON public.activity_log_v2
  FOR SELECT TO authenticated USING (
    (org_id IS NOT NULL AND public.is_org_member(org_id)) OR public.is_platform_admin(auth.uid())
  );
CREATE INDEX idx_activity_org_at ON public.activity_log_v2 (org_id, at DESC);
CREATE INDEX idx_activity_actor_at ON public.activity_log_v2 (actor_id, at DESC);

-- ---------- impersonation_sessions ----------
CREATE TABLE public.impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reason text,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '60 minutes'),
  ended_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.impersonation_sessions TO authenticated;
GRANT ALL ON public.impersonation_sessions TO service_role;
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage own impersonation sessions" ON public.impersonation_sessions
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) AND admin_id = auth.uid())
  WITH CHECK (public.is_platform_admin(auth.uid()) AND admin_id = auth.uid());

-- ---------- portal_tokens ----------
CREATE TABLE public.portal_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('invoice','quote','proposal')),
  entity_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.portal_tokens TO authenticated;
GRANT ALL ON public.portal_tokens TO service_role;
ALTER TABLE public.portal_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage portal tokens" ON public.portal_tokens
  FOR ALL TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));

CREATE OR REPLACE FUNCTION public.create_portal_token(_org_id uuid, _entity_type text, _entity_id uuid, _ttl_days int DEFAULT 30)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t text;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN RAISE EXCEPTION 'not authorised'; END IF;
  _t := encode(gen_random_bytes(24), 'hex');
  INSERT INTO public.portal_tokens (org_id, entity_type, entity_id, token, expires_at, created_by)
  VALUES (_org_id, _entity_type, _entity_id, _t, now() + make_interval(days => _ttl_days), auth.uid());
  RETURN _t;
END $$;
REVOKE EXECUTE ON FUNCTION public.create_portal_token(uuid,text,uuid,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_portal_token(uuid,text,uuid,int) TO authenticated;

-- ---------- client_users ----------
CREATE TABLE public.client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_users TO authenticated;
GRANT ALL ON public.client_users TO service_role;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members manage client users" ON public.client_users
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND public.is_org_member(c.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND public.is_org_member(c.org_id)));

-- ---------- disputes ----------
CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  raised_by_client_user_id uuid REFERENCES public.client_users(id) ON DELETE SET NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_review','resolved','rejected')),
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org members read disputes" ON public.disputes FOR SELECT TO authenticated
  USING (public.is_org_member(org_id) OR public.is_platform_admin(auth.uid()));
CREATE POLICY "org admins update disputes" ON public.disputes FOR UPDATE TO authenticated
  USING (public.can_write_org(org_id)) WITH CHECK (public.can_write_org(org_id));
CREATE TRIGGER trg_disputes_updated BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- case_events ----------
CREATE TABLE public.case_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.legal_notices(id) ON DELETE CASCADE,
  actor_id uuid,
  actor_type text NOT NULL,   -- user | lawyer | client | system | platform_admin
  kind text NOT NULL,          -- draft_created | notice_sent | response_received | escalated | closed | note
  payload jsonb,
  at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.case_events TO authenticated;
GRANT ALL ON public.case_events TO service_role;
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case events readable by org and platform admins" ON public.case_events FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.legal_notices n WHERE n.id = case_id AND (public.is_org_member(n.org_id) OR public.is_platform_admin(auth.uid())))
  );
CREATE POLICY "case events insert by org members" ON public.case_events FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.legal_notices n WHERE n.id = case_id AND public.is_org_member(n.org_id))
    OR public.is_platform_admin(auth.uid())
  );

-- ---------- lawyer_payouts ----------
CREATE TABLE public.lawyer_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id uuid NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  period_month date NOT NULL,
  gross_inr numeric NOT NULL DEFAULT 0,
  platform_fee_inr numeric NOT NULL DEFAULT 0,
  net_inr numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed')),
  razorpay_transfer_id text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lawyer_id, period_month)
);
GRANT SELECT ON public.lawyer_payouts TO authenticated;
GRANT ALL ON public.lawyer_payouts TO service_role;
ALTER TABLE public.lawyer_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lawyer sees own payouts" ON public.lawyer_payouts FOR SELECT TO authenticated
  USING (public.is_lawyer_of(lawyer_id) OR public.is_platform_admin(auth.uid()));

-- ---------- lawyer_kyc ----------
CREATE TABLE public.lawyer_kyc (
  lawyer_id uuid PRIMARY KEY REFERENCES public.lawyers(id) ON DELETE CASCADE,
  bar_council_doc_url text,
  id_doc_url text,
  address_doc_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.lawyer_kyc TO authenticated;
GRANT ALL ON public.lawyer_kyc TO service_role;
ALTER TABLE public.lawyer_kyc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lawyer manages own kyc" ON public.lawyer_kyc FOR ALL TO authenticated
  USING (public.is_lawyer_of(lawyer_id) OR public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_lawyer_of(lawyer_id) OR public.is_platform_admin(auth.uid()));
CREATE TRIGGER trg_lawyer_kyc_updated BEFORE UPDATE ON public.lawyer_kyc FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- portal_context helper (public, token-verified) ----------
CREATE OR REPLACE FUNCTION public.get_portal_context(_token text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.portal_tokens; _payload jsonb;
BEGIN
  SELECT * INTO _row FROM public.portal_tokens WHERE token = _token;
  IF _row.id IS NULL OR _row.revoked_at IS NOT NULL OR (_row.expires_at IS NOT NULL AND _row.expires_at < now()) THEN
    RETURN jsonb_build_object('ok', false, 'reason','invalid_or_expired');
  END IF;
  UPDATE public.portal_tokens SET last_used_at = now() WHERE id = _row.id;
  RETURN jsonb_build_object('ok', true, 'org_id', _row.org_id, 'entity_type', _row.entity_type, 'entity_id', _row.entity_id);
END $$;
REVOKE EXECUTE ON FUNCTION public.get_portal_context(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_portal_context(text) TO anon, authenticated, service_role;
