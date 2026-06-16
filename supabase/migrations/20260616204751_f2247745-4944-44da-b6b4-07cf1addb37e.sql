
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS client_type text;
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS client_email text;

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_name text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_type text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb;
