
-- =====================================================================
-- BILLENTY core schema: multi-tenant SaaS with auth, RLS, legal module
-- =====================================================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'lawyer', 'client_portal_user');
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'accountant', 'viewer');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'declined', 'expired');
CREATE TYPE public.proposal_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'declined');
CREATE TYPE public.case_stage AS ENUM ('opened', 'notice_sent', 'reply_awaited', 'escalated', 'filed', 'resolved', 'withdrawn');
CREATE TYPE public.legal_doc_type AS ENUM ('demand_letter', 'sec138_notice', 'sec8_ibc_demand', 'msme_samadhaan', 'client_reply', 'other');
CREATE TYPE public.engagement_status AS ENUM ('proposed', 'accepted', 'declined', 'completed', 'cancelled');

-- =====================================================================
-- Updated_at helper
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =====================================================================
-- profiles
-- =====================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- user_roles (platform-level)
-- =====================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =====================================================================
-- organizations
-- =====================================================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  gstin TEXT,
  pan TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT NOT NULL DEFAULT 'India',
  logo_url TEXT,
  signature_url TEXT,
  upi_vpa TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  invoice_prefix TEXT DEFAULT 'INV',
  quote_prefix TEXT DEFAULT 'QT',
  proposal_prefix TEXT DEFAULT 'PROP',
  default_terms TEXT,
  default_notes TEXT,
  plan TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER organizations_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- organization_members
-- =====================================================================
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.org_role NOT NULL DEFAULT 'viewer',
  invited_email TEXT,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org ON public.organization_members(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT ALL ON public.organization_members TO service_role;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER helpers (avoid recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = _org_id AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.org_role_of(_org_id UUID)
RETURNS public.org_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.organization_members WHERE org_id = _org_id AND user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = _org_id AND user_id = auth.uid() AND role IN ('owner','admin')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_write_org(_org_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE org_id = _org_id AND user_id = auth.uid() AND role IN ('owner','admin','accountant')
  )
$$;

-- organization_members policies
CREATE POLICY "Members view org memberships" ON public.organization_members FOR SELECT TO authenticated
  USING (public.is_org_member(org_id));
CREATE POLICY "Admins manage memberships" ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (public.is_org_admin(org_id));
CREATE POLICY "Admins update memberships" ON public.organization_members FOR UPDATE TO authenticated
  USING (public.is_org_admin(org_id));
CREATE POLICY "Admins delete memberships" ON public.organization_members FOR DELETE TO authenticated
  USING (public.is_org_admin(org_id));

-- organizations policies
CREATE POLICY "Members view their orgs" ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(id));
CREATE POLICY "Anyone can create an org" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Admins update org" ON public.organizations FOR UPDATE TO authenticated
  USING (public.is_org_admin(id));
CREATE POLICY "Owners delete org" ON public.organizations FOR DELETE TO authenticated
  USING (public.org_role_of(id) = 'owner');

-- Auto-add creator as owner
CREATE OR REPLACE FUNCTION public.add_org_creator_as_owner()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.organization_members (org_id, user_id, role, joined_at)
  VALUES (NEW.id, NEW.created_by, 'owner', now())
  ON CONFLICT (org_id, user_id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER organizations_add_owner AFTER INSERT ON public.organizations
  FOR EACH ROW WHEN (NEW.created_by IS NOT NULL)
  EXECUTE FUNCTION public.add_org_creator_as_owner();

-- =====================================================================
-- clients
-- =====================================================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  gstin TEXT,
  pan TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  notes TEXT,
  portal_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_org ON public.clients(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view clients" ON public.clients FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Writers update clients" ON public.clients FOR UPDATE TO authenticated USING (public.can_write_org(org_id));
CREATE POLICY "Admins delete clients" ON public.clients FOR DELETE TO authenticated USING (public.is_org_admin(org_id));
CREATE TRIGGER clients_updated BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- products
-- =====================================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  category TEXT,
  price NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  unit TEXT DEFAULT 'unit',
  hsn_code TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_org ON public.products(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view products" ON public.products FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Writers update products" ON public.products FOR UPDATE TO authenticated USING (public.can_write_org(org_id));
CREATE POLICY "Admins delete products" ON public.products FOR DELETE TO authenticated USING (public.is_org_admin(org_id));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- invoices
-- =====================================================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  currency TEXT NOT NULL DEFAULT 'INR',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, number)
);
CREATE INDEX idx_invoices_org ON public.invoices(org_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view invoices" ON public.invoices FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Writers update invoices" ON public.invoices FOR UPDATE TO authenticated USING (public.can_write_org(org_id));
CREATE POLICY "Admins delete invoices" ON public.invoices FOR DELETE TO authenticated USING (public.is_org_admin(org_id));
CREATE TRIGGER invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- invoice_items
-- =====================================================================
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(14,2) NOT NULL DEFAULT 1,
  rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view invoice items" ON public.invoice_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_org_member(i.org_id)));
CREATE POLICY "Writers insert invoice items" ON public.invoice_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.can_write_org(i.org_id)));
CREATE POLICY "Writers update invoice items" ON public.invoice_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.can_write_org(i.org_id)));
CREATE POLICY "Writers delete invoice items" ON public.invoice_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.can_write_org(i.org_id)));

-- =====================================================================
-- quotes & quote_items
-- =====================================================================
CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  status public.quote_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  currency TEXT NOT NULL DEFAULT 'INR',
  subtotal NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, number)
);
CREATE INDEX idx_quotes_org ON public.quotes(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view quotes" ON public.quotes FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers insert quotes" ON public.quotes FOR INSERT TO authenticated WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Writers update quotes" ON public.quotes FOR UPDATE TO authenticated USING (public.can_write_org(org_id));
CREATE POLICY "Admins delete quotes" ON public.quotes FOR DELETE TO authenticated USING (public.is_org_admin(org_id));
CREATE TRIGGER quotes_updated BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(14,2) NOT NULL DEFAULT 1,
  rate NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_items_quote ON public.quote_items(quote_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_items TO authenticated;
GRANT ALL ON public.quote_items TO service_role;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view quote items" ON public.quote_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_id AND public.is_org_member(q.org_id)));
CREATE POLICY "Writers manage quote items" ON public.quote_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_id AND public.can_write_org(q.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotes q WHERE q.id = quote_id AND public.can_write_org(q.org_id)));

-- =====================================================================
-- proposals
-- =====================================================================
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  status public.proposal_status NOT NULL DEFAULT 'draft',
  project_type TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  total_value NUMERIC(14,2) NOT NULL DEFAULT 0,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  client_signature TEXT,
  client_signed_at TIMESTAMPTZ,
  sender_signature TEXT,
  sender_signed_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, number)
);
CREATE INDEX idx_proposals_org ON public.proposals(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposals TO authenticated;
GRANT ALL ON public.proposals TO service_role;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view proposals" ON public.proposals FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers insert proposals" ON public.proposals FOR INSERT TO authenticated WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Writers update proposals" ON public.proposals FOR UPDATE TO authenticated USING (public.can_write_org(org_id));
CREATE POLICY "Admins delete proposals" ON public.proposals FOR DELETE TO authenticated USING (public.is_org_admin(org_id));
CREATE TRIGGER proposals_updated BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- payments
-- =====================================================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT,
  reference TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX idx_payments_org ON public.payments(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view payments" ON public.payments FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Writers update payments" ON public.payments FOR UPDATE TO authenticated USING (public.can_write_org(org_id));
CREATE POLICY "Admins delete payments" ON public.payments FOR DELETE TO authenticated USING (public.is_org_admin(org_id));

-- =====================================================================
-- recurring_invoices
-- =====================================================================
CREATE TABLE public.recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  template JSONB NOT NULL,
  frequency TEXT NOT NULL,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recurring_invoices TO authenticated;
GRANT ALL ON public.recurring_invoices TO service_role;
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view recurring" ON public.recurring_invoices FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers manage recurring" ON public.recurring_invoices FOR ALL TO authenticated
  USING (public.can_write_org(org_id)) WITH CHECK (public.can_write_org(org_id));
CREATE TRIGGER recurring_updated BEFORE UPDATE ON public.recurring_invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- lawyers (platform-wide marketplace)
-- =====================================================================
CREATE TABLE public.lawyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bar_council_no TEXT NOT NULL,
  states TEXT[] NOT NULL DEFAULT '{}',
  specialties TEXT[] NOT NULL DEFAULT '{}',
  rate_per_hour NUMERIC(14,2),
  bio TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lawyers TO authenticated;
GRANT INSERT, UPDATE ON public.lawyers TO authenticated;
GRANT ALL ON public.lawyers TO service_role;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authed views verified lawyers" ON public.lawyers FOR SELECT TO authenticated
  USING (verified = true OR user_id = auth.uid());
CREATE POLICY "Lawyers create own profile" ON public.lawyers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Lawyers update own profile" ON public.lawyers FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER lawyers_updated BEFORE UPDATE ON public.lawyers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- legal_cases
-- =====================================================================
CREATE TABLE public.legal_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  stage public.case_stage NOT NULL DEFAULT 'opened',
  amount_claimed NUMERIC(14,2),
  interest_rate NUMERIC(5,2) DEFAULT 18,
  notes TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_legal_cases_org ON public.legal_cases(org_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_cases TO authenticated;
GRANT ALL ON public.legal_cases TO service_role;
ALTER TABLE public.legal_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view cases" ON public.legal_cases FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers insert cases" ON public.legal_cases FOR INSERT TO authenticated WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Writers update cases" ON public.legal_cases FOR UPDATE TO authenticated USING (public.can_write_org(org_id));
CREATE POLICY "Admins delete cases" ON public.legal_cases FOR DELETE TO authenticated USING (public.is_org_admin(org_id));
CREATE TRIGGER cases_updated BEFORE UPDATE ON public.legal_cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- legal_documents
-- =====================================================================
CREATE TABLE public.legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  doc_type public.legal_doc_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_legal_docs_case ON public.legal_documents(case_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_documents TO authenticated;
GRANT ALL ON public.legal_documents TO service_role;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view legal docs" ON public.legal_documents FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Writers manage legal docs" ON public.legal_documents FOR ALL TO authenticated
  USING (public.can_write_org(org_id)) WITH CHECK (public.can_write_org(org_id));

-- =====================================================================
-- lawyer_engagements
-- =====================================================================
CREATE TABLE public.lawyer_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES public.lawyers(id) ON DELETE CASCADE,
  status public.engagement_status NOT NULL DEFAULT 'proposed',
  scope TEXT,
  fee NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_engagements_case ON public.lawyer_engagements(case_id);
CREATE INDEX idx_engagements_lawyer ON public.lawyer_engagements(lawyer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lawyer_engagements TO authenticated;
GRANT ALL ON public.lawyer_engagements TO service_role;
ALTER TABLE public.lawyer_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members + assigned lawyer view" ON public.lawyer_engagements FOR SELECT TO authenticated
  USING (public.is_org_member(org_id) OR EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = lawyer_id AND l.user_id = auth.uid()));
CREATE POLICY "Org writers insert engagement" ON public.lawyer_engagements FOR INSERT TO authenticated
  WITH CHECK (public.can_write_org(org_id));
CREATE POLICY "Org writers or lawyer update" ON public.lawyer_engagements FOR UPDATE TO authenticated
  USING (public.can_write_org(org_id) OR EXISTS (SELECT 1 FROM public.lawyers l WHERE l.id = lawyer_id AND l.user_id = auth.uid()));
CREATE TRIGGER engagements_updated BEFORE UPDATE ON public.lawyer_engagements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- legal_messages (in-app chat for case)
-- =====================================================================
CREATE TABLE public.legal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.legal_cases(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_legal_messages_case ON public.legal_messages(case_id);
GRANT SELECT, INSERT ON public.legal_messages TO authenticated;
GRANT ALL ON public.legal_messages TO service_role;
ALTER TABLE public.legal_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org + lawyer view case messages" ON public.legal_messages FOR SELECT TO authenticated
  USING (public.is_org_member(org_id) OR EXISTS (
    SELECT 1 FROM public.lawyer_engagements e JOIN public.lawyers l ON l.id = e.lawyer_id
    WHERE e.case_id = case_id AND l.user_id = auth.uid()
  ));
CREATE POLICY "Org + lawyer send messages" ON public.legal_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND (public.is_org_member(org_id) OR EXISTS (
    SELECT 1 FROM public.lawyer_engagements e JOIN public.lawyers l ON l.id = e.lawyer_id
    WHERE e.case_id = case_id AND l.user_id = auth.uid()
  )));

-- =====================================================================
-- client_portal_access (magic token links for clients)
-- =====================================================================
CREATE TABLE public.client_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_portal_token ON public.client_portal_access(token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_portal_access TO authenticated;
GRANT SELECT ON public.client_portal_access TO anon;
GRANT ALL ON public.client_portal_access TO service_role;
ALTER TABLE public.client_portal_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members manage portal tokens" ON public.client_portal_access FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND public.is_org_member(c.org_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND public.can_write_org(c.org_id)));
-- Token lookup is intentionally NOT exposed via anon SELECT to keep tokens unguessable;
-- the public portal view will go through a SECURITY DEFINER RPC in a later phase.

-- =====================================================================
-- audit_log
-- =====================================================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_org ON public.audit_log(org_id, created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org admins view audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.is_org_admin(org_id));
CREATE POLICY "Members write audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id) AND actor_id = auth.uid());
