-- Follow-up hardening on top of the existing RLS migration.
-- Keep the current UI behavior, but enforce technician limits in the database.

DROP POLICY IF EXISTS "Authenticated upload service-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete service-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and assigned technicians upload service-photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins and assigned technicians delete service-photos" ON storage.objects;

CREATE POLICY "Admins and assigned technicians upload service-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'service-photos'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (
      public.has_role(auth.uid(), 'technicien')
      AND EXISTS (
        SELECT 1
        FROM public.services
        WHERE id::text = (storage.foldername(name))[1]
          AND prenom = public.current_user_pseudo()
      )
    )
  )
);

CREATE POLICY "Admins and assigned technicians delete service-photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'service-photos'
  AND (
    public.has_role(auth.uid(), 'admin')
    OR (
      public.has_role(auth.uid(), 'technicien')
      AND EXISTS (
        SELECT 1
        FROM public.services
        WHERE id::text = (storage.foldername(name))[1]
          AND prenom = public.current_user_pseudo()
      )
    )
  )
);

CREATE OR REPLACE FUNCTION public.enforce_services_technician_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF NOT public.has_role(auth.uid(), 'technicien')
     OR OLD.prenom IS DISTINCT FROM public.current_user_pseudo()
     OR NEW.prenom IS DISTINCT FROM OLD.prenom
     OR NEW.modele IS DISTINCT FROM OLD.modele
     OR NEW.immatriculation IS DISTINCT FROM OLD.immatriculation
     OR NEW.date_entree IS DISTINCT FROM OLD.date_entree
     OR NEW.date_sortie IS DISTINCT FROM OLD.date_sortie
     OR NEW.kilometrage IS DISTINCT FROM OLD.kilometrage
     OR NEW.a_verifier IS DISTINCT FROM OLD.a_verifier
     OR NEW.mecanique_taches IS DISTINCT FROM OLD.mecanique_taches
     OR NEW.mecanique_notes_chef IS DISTINCT FROM OLD.mecanique_notes_chef
     OR NEW.carrosserie_taches IS DISTINCT FROM OLD.carrosserie_taches
     OR NEW.carrosserie_notes_chef IS DISTINCT FROM OLD.carrosserie_notes_chef
     OR NEW.has_mecanique IS DISTINCT FROM OLD.has_mecanique
     OR NEW.has_carrosserie IS DISTINCT FROM OLD.has_carrosserie
     OR NEW.mecanique_photos_chef IS DISTINCT FROM OLD.mecanique_photos_chef
     OR NEW.carrosserie_photos_chef IS DISTINCT FROM OLD.carrosserie_photos_chef THEN
    RAISE EXCEPTION 'Modification non autorisée pour ce service';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_services_technician_update ON public.services;
CREATE TRIGGER enforce_services_technician_update
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.enforce_services_technician_update();
