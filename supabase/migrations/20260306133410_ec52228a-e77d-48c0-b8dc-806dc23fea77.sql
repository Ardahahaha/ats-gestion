
-- Table for custom tables (each "board" in Atelier)
CREATE TABLE public.custom_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for columns of each custom table
CREATE TABLE public.custom_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.custom_tables(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for rows of each custom table
CREATE TABLE public.custom_rows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.custom_tables(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for cell values
CREATE TABLE public.custom_cells (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  row_id UUID NOT NULL REFERENCES public.custom_rows(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.custom_columns(id) ON DELETE CASCADE,
  value TEXT NOT NULL DEFAULT '',
  UNIQUE(row_id, column_id)
);

-- RLS policies (public access like vehicules)
ALTER TABLE public.custom_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_cells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select" ON public.custom_tables FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.custom_tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.custom_tables FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.custom_tables FOR DELETE USING (true);

CREATE POLICY "Public select" ON public.custom_columns FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.custom_columns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.custom_columns FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.custom_columns FOR DELETE USING (true);

CREATE POLICY "Public select" ON public.custom_rows FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.custom_rows FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.custom_rows FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.custom_rows FOR DELETE USING (true);

CREATE POLICY "Public select" ON public.custom_cells FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.custom_cells FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.custom_cells FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.custom_cells FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_rows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_cells;
