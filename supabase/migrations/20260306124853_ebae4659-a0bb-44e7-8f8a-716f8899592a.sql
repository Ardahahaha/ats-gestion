
-- Create table for vehicle tracking
CREATE TABLE public.vehicules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  immatriculation TEXT DEFAULT '',
  entree TEXT DEFAULT '',
  client TEXT DEFAULT '',
  travaux TEXT DEFAULT '',
  pieces TEXT DEFAULT '',
  sortie TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicules ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Anyone can view vehicules" ON public.vehicules FOR SELECT USING (true);

-- Allow everyone to insert
CREATE POLICY "Anyone can insert vehicules" ON public.vehicules FOR INSERT WITH CHECK (true);

-- Allow everyone to update
CREATE POLICY "Anyone can update vehicules" ON public.vehicules FOR UPDATE USING (true);

-- Allow everyone to delete
CREATE POLICY "Anyone can delete vehicules" ON public.vehicules FOR DELETE USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vehicules_updated_at
  BEFORE UPDATE ON public.vehicules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
