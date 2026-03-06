
-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Anyone can delete vehicules" ON public.vehicules;
DROP POLICY IF EXISTS "Anyone can insert vehicules" ON public.vehicules;
DROP POLICY IF EXISTS "Anyone can update vehicules" ON public.vehicules;
DROP POLICY IF EXISTS "Anyone can view vehicules" ON public.vehicules;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Public select" ON public.vehicules FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.vehicules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.vehicules FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.vehicules FOR DELETE USING (true);
