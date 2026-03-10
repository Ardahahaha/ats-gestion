-- Create storage bucket for service photos
INSERT INTO storage.buckets (id, name, public) VALUES ('service-photos', 'service-photos', true);

-- Allow public read access
CREATE POLICY "Public read service photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'service-photos');

-- Allow public insert
CREATE POLICY "Public insert service photos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'service-photos');

-- Allow public delete
CREATE POLICY "Public delete service photos" ON storage.objects FOR DELETE TO public USING (bucket_id = 'service-photos');

-- Add photos columns to services table (jsonb arrays of photo URLs)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS mecanique_photos jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS carrosserie_photos jsonb NOT NULL DEFAULT '[]'::jsonb;