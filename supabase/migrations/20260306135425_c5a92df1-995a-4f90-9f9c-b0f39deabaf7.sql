
CREATE TABLE public.gestion_vehicules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marque text NOT NULL DEFAULT '',
  modele text NOT NULL DEFAULT '',
  immatriculation text NOT NULL DEFAULT '',
  etat text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gestion_vehicules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select" ON public.gestion_vehicules FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.gestion_vehicules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.gestion_vehicules FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.gestion_vehicules FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.gestion_vehicules;
