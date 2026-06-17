-- Schedule auto-notice-cron daily at 9am IST (03:30 UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.unschedule('billenty-auto-notice-daily') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname='billenty-auto-notice-daily');

SELECT cron.schedule(
  'billenty-auto-notice-daily',
  '30 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://hhmcanzmwcmtfeuzqlss.supabase.co/functions/v1/auto-notice-cron',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable_QRYdby-zCH4B0PL7qFxYtw_eRaDScX6"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);