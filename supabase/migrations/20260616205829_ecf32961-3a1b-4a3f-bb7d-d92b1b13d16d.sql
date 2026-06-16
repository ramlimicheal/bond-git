
ALTER TABLE public.lawyers ALTER COLUMN user_id DROP NOT NULL;

INSERT INTO public.lawyers (full_name, email, phone, bar_council_no, states, specialties, rate_per_hour, bio, verified, active)
VALUES
('Adv. Anjali Mehra','anjali.mehra@example.in','+91 98200 11111','MAH/12345/2008',ARRAY['Maharashtra'],ARRAY['Contract Disputes','MSME Recovery'],3500,'Mumbai. Commercial litigation specialist focused on small-business recovery. 14 yrs.',true,true),
('Adv. Rohan Khanna','rohan.khanna@example.in','+91 98100 22222','DEL/55678/2010',ARRAY['Delhi'],ARRAY['NI Act §138','IBC §8'],4000,'New Delhi. Cheque bounce and insolvency notice expert. 12 yrs.',true,true),
('Adv. Priya Iyer','priya.iyer@example.in','+91 99800 33333','KAR/77891/2012',ARRAY['Karnataka'],ARRAY['Contract Disputes','Freelancer Payments'],3000,'Bangalore. Helps tech freelancers recover unpaid invoices. 10 yrs.',true,true),
('Adv. Vikram Reddy','vikram.reddy@example.in','+91 98400 44444','TN/22334/2007',ARRAY['Tamil Nadu'],ARRAY['MSME Samadhaan','NI Act §138'],3800,'Chennai. MSME dispute resolution under MSMED Act. 15 yrs.',true,true),
('Adv. Sneha Joshi','sneha.joshi@example.in','+91 98600 55555','MAH/99001/2015',ARRAY['Maharashtra'],ARRAY['Contract Disputes','Demand Notices'],2500,'Pune. Quick-turnaround demand notice drafting. 8 yrs.',true,true),
('Adv. Arjun Nair','arjun.nair@example.in','+91 99500 66666','KER/33445/2009',ARRAY['Kerala'],ARRAY['IBC §8','Commercial Recovery'],3200,'Kochi. IBC §8 notices and commercial recovery. 13 yrs.',true,true)
ON CONFLICT DO NOTHING;
