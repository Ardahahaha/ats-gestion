
DROP POLICY IF EXISTS "Admin insert" ON public.vehicules;
CREATE POLICY "Authenticated insert" ON public.vehicules FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update" ON public.vehicules;
CREATE POLICY "Authenticated update" ON public.vehicules FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin delete" ON public.vehicules;
CREATE POLICY "Authenticated delete" ON public.vehicules FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin insert" ON public.services;
CREATE POLICY "Authenticated insert" ON public.services FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin delete" ON public.services;
CREATE POLICY "Authenticated delete" ON public.services FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin insert" ON public.gestion_vehicules;
CREATE POLICY "Authenticated insert" ON public.gestion_vehicules FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update" ON public.gestion_vehicules;
CREATE POLICY "Authenticated update" ON public.gestion_vehicules FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin delete" ON public.gestion_vehicules;
CREATE POLICY "Authenticated delete" ON public.gestion_vehicules FOR DELETE TO authenticated USING (true);
