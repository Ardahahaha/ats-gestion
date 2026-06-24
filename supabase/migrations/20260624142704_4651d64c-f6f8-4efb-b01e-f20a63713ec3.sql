
-- =========================================================
-- Helper: pseudo of current authenticated user
-- =========================================================
CREATE OR REPLACE FUNCTION public.current_user_pseudo()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pseudo FROM public.profiles WHERE user_id = auth.uid()
$$;

-- =========================================================
-- vehicules : admin only
-- =========================================================
DROP POLICY IF EXISTS "Authenticated select" ON public.vehicules;
DROP POLICY IF EXISTS "Authenticated insert" ON public.vehicules;
DROP POLICY IF EXISTS "Authenticated update" ON public.vehicules;
DROP POLICY IF EXISTS "Authenticated delete" ON public.vehicules;

CREATE POLICY "Admins manage vehicules"
ON public.vehicules FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- gestion_vehicules : admin only
-- =========================================================
DROP POLICY IF EXISTS "Authenticated select" ON public.gestion_vehicules;
DROP POLICY IF EXISTS "Authenticated insert" ON public.gestion_vehicules;
DROP POLICY IF EXISTS "Authenticated update" ON public.gestion_vehicules;
DROP POLICY IF EXISTS "Authenticated delete" ON public.gestion_vehicules;

CREATE POLICY "Admins manage gestion_vehicules"
ON public.gestion_vehicules FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- services : admin full / tech only own assigned
-- =========================================================
DROP POLICY IF EXISTS "Authenticated select" ON public.services;
DROP POLICY IF EXISTS "Authenticated insert" ON public.services;
DROP POLICY IF EXISTS "Authenticated update" ON public.services;
DROP POLICY IF EXISTS "Authenticated delete" ON public.services;

CREATE POLICY "Admins manage services"
ON public.services FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Techs read own services"
ON public.services FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'technicien')
  AND prenom = public.current_user_pseudo()
);

CREATE POLICY "Techs update own services"
ON public.services FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'technicien')
  AND prenom = public.current_user_pseudo()
)
WITH CHECK (
  public.has_role(auth.uid(), 'technicien')
  AND prenom = public.current_user_pseudo()
);

-- =========================================================
-- custom_* : admin only
-- =========================================================
DROP POLICY IF EXISTS "Authenticated select" ON public.custom_tables;
DROP POLICY IF EXISTS "Authenticated insert" ON public.custom_tables;
DROP POLICY IF EXISTS "Authenticated update" ON public.custom_tables;
DROP POLICY IF EXISTS "Authenticated delete" ON public.custom_tables;
CREATE POLICY "Admins manage custom_tables" ON public.custom_tables FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated select" ON public.custom_columns;
DROP POLICY IF EXISTS "Authenticated insert" ON public.custom_columns;
DROP POLICY IF EXISTS "Authenticated update" ON public.custom_columns;
DROP POLICY IF EXISTS "Authenticated delete" ON public.custom_columns;
CREATE POLICY "Admins manage custom_columns" ON public.custom_columns FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated select" ON public.custom_rows;
DROP POLICY IF EXISTS "Authenticated insert" ON public.custom_rows;
DROP POLICY IF EXISTS "Authenticated update" ON public.custom_rows;
DROP POLICY IF EXISTS "Authenticated delete" ON public.custom_rows;
CREATE POLICY "Admins manage custom_rows" ON public.custom_rows FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated select" ON public.custom_cells;
DROP POLICY IF EXISTS "Authenticated insert" ON public.custom_cells;
DROP POLICY IF EXISTS "Authenticated update" ON public.custom_cells;
DROP POLICY IF EXISTS "Authenticated delete" ON public.custom_cells;
CREATE POLICY "Admins manage custom_cells" ON public.custom_cells FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- user_roles : tighten
-- =========================================================
DROP POLICY IF EXISTS "Authenticated can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;

CREATE POLICY "Users read own role"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- (Existing "Admins can manage all roles" FOR ALL stays — covers admin reads/writes)

-- =========================================================
-- profiles : restrict reads
-- =========================================================
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;

CREATE POLICY "Users read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- Storage: service-photos bucket
-- =========================================================
DROP POLICY IF EXISTS "Public read service photos" ON storage.objects;
DROP POLICY IF EXISTS "Public insert service photos" ON storage.objects;
DROP POLICY IF EXISTS "Public delete service photos" ON storage.objects;

CREATE POLICY "Authenticated read service-photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'service-photos');

CREATE POLICY "Authenticated upload service-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'service-photos');

CREATE POLICY "Authenticated delete service-photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'service-photos');
