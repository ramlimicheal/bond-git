
CREATE POLICY "org members can read brand assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'brand-assets' AND public.is_org_member((storage.foldername(name))[1]::uuid));

CREATE POLICY "org writers can upload brand assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'brand-assets' AND public.can_write_org((storage.foldername(name))[1]::uuid));

CREATE POLICY "org writers can update brand assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'brand-assets' AND public.can_write_org((storage.foldername(name))[1]::uuid))
WITH CHECK (bucket_id = 'brand-assets' AND public.can_write_org((storage.foldername(name))[1]::uuid));

CREATE POLICY "org writers can delete brand assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'brand-assets' AND public.can_write_org((storage.foldername(name))[1]::uuid));
