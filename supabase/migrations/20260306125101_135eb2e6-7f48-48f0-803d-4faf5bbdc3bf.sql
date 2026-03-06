
-- Drop restrictive policies
DROP POLICY "Anyone can delete vehicules" ON public.vehicules;
DROP POLICY "Anyone can insert vehicules" ON public.vehicules;
DROP POLICY "Anyone can update vehicules" ON public.vehicules;
DROP POLICY "Anyone can view vehicules" ON public.vehicules;

-- Recreate as permissive
CREATE POLICY "Anyone can view vehicules" ON public.vehicules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert vehicules" ON public.vehicules FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update vehicules" ON public.vehicules FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete vehicules" ON public.vehicules FOR DELETE TO anon, authenticated USING (true);
