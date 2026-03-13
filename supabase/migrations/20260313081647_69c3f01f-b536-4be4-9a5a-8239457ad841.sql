ALTER TABLE public.services ADD COLUMN mecanique_photos_chef jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.services ADD COLUMN carrosserie_photos_chef jsonb NOT NULL DEFAULT '[]'::jsonb;