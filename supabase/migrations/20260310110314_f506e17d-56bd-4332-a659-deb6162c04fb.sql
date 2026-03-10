
-- Drop all existing permissive public policies on all tables
-- vehicules
DROP POLICY IF EXISTS "Public delete" ON public.vehicules;
DROP POLICY IF EXISTS "Public insert" ON public.vehicules;
DROP POLICY IF EXISTS "Public select" ON public.vehicules;
DROP POLICY IF EXISTS "Public update" ON public.vehicules;

-- services
DROP POLICY IF EXISTS "Public delete" ON public.services;
DROP POLICY IF EXISTS "Public insert" ON public.services;
DROP POLICY IF EXISTS "Public select" ON public.services;
DROP POLICY IF EXISTS "Public update" ON public.services;

-- gestion_vehicules
DROP POLICY IF EXISTS "Public delete" ON public.gestion_vehicules;
DROP POLICY IF EXISTS "Public insert" ON public.gestion_vehicules;
DROP POLICY IF EXISTS "Public select" ON public.gestion_vehicules;
DROP POLICY IF EXISTS "Public update" ON public.gestion_vehicules;

-- custom_tables
DROP POLICY IF EXISTS "Public delete" ON public.custom_tables;
DROP POLICY IF EXISTS "Public insert" ON public.custom_tables;
DROP POLICY IF EXISTS "Public select" ON public.custom_tables;
DROP POLICY IF EXISTS "Public update" ON public.custom_tables;

-- custom_columns
DROP POLICY IF EXISTS "Public delete" ON public.custom_columns;
DROP POLICY IF EXISTS "Public insert" ON public.custom_columns;
DROP POLICY IF EXISTS "Public select" ON public.custom_columns;
DROP POLICY IF EXISTS "Public update" ON public.custom_columns;

-- custom_rows
DROP POLICY IF EXISTS "Public delete" ON public.custom_rows;
DROP POLICY IF EXISTS "Public insert" ON public.custom_rows;
DROP POLICY IF EXISTS "Public select" ON public.custom_rows;
DROP POLICY IF EXISTS "Public update" ON public.custom_rows;

-- custom_cells
DROP POLICY IF EXISTS "Public delete" ON public.custom_cells;
DROP POLICY IF EXISTS "Public insert" ON public.custom_cells;
DROP POLICY IF EXISTS "Public select" ON public.custom_cells;
DROP POLICY IF EXISTS "Public update" ON public.custom_cells;

-- New policies: authenticated users can read all tables
-- Admin can write to all tables, technicien can only update specific fields (enforced in app)

-- vehicules: all authenticated can read, admin can write
CREATE POLICY "Authenticated select" ON public.vehicules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert" ON public.vehicules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update" ON public.vehicules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete" ON public.vehicules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- gestion_vehicules: all authenticated can read, admin can write
CREATE POLICY "Authenticated select" ON public.gestion_vehicules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert" ON public.gestion_vehicules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update" ON public.gestion_vehicules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete" ON public.gestion_vehicules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- services: all authenticated can read, admin can insert/delete, all authenticated can update (tech updates specific fields)
CREATE POLICY "Authenticated select" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin insert" ON public.services FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated update" ON public.services FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete" ON public.services FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- custom_tables: all authenticated can read/write
CREATE POLICY "Authenticated select" ON public.custom_tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON public.custom_tables FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.custom_tables FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete" ON public.custom_tables FOR DELETE TO authenticated USING (true);

-- custom_columns
CREATE POLICY "Authenticated select" ON public.custom_columns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON public.custom_columns FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.custom_columns FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete" ON public.custom_columns FOR DELETE TO authenticated USING (true);

-- custom_rows
CREATE POLICY "Authenticated select" ON public.custom_rows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON public.custom_rows FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.custom_rows FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete" ON public.custom_rows FOR DELETE TO authenticated USING (true);

-- custom_cells
CREATE POLICY "Authenticated select" ON public.custom_cells FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert" ON public.custom_cells FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update" ON public.custom_cells FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete" ON public.custom_cells FOR DELETE TO authenticated USING (true);
