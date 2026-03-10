ALTER TABLE public.services ADD COLUMN IF NOT EXISTS has_mecanique boolean NOT NULL DEFAULT true;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS has_carrosserie boolean NOT NULL DEFAULT true;