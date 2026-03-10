
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  immatriculation text NOT NULL DEFAULT '',
  date_entree text NOT NULL DEFAULT '',
  date_sortie text NOT NULL DEFAULT '',
  mecanique_taches jsonb NOT NULL DEFAULT '[]'::jsonb,
  mecanique_validees jsonb NOT NULL DEFAULT '[]'::jsonb,
  mecanique_notes_chef text NOT NULL DEFAULT '',
  mecanique_notes_meca text NOT NULL DEFAULT '',
  carrosserie_taches jsonb NOT NULL DEFAULT '[]'::jsonb,
  carrosserie_validees jsonb NOT NULL DEFAULT '[]'::jsonb,
  carrosserie_notes_chef text NOT NULL DEFAULT '',
  carrosserie_notes_meca text NOT NULL DEFAULT ''
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select" ON public.services FOR SELECT TO public USING (true);
CREATE POLICY "Public insert" ON public.services FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update" ON public.services FOR UPDATE TO public USING (true);
CREATE POLICY "Public delete" ON public.services FOR DELETE TO public USING (true);
