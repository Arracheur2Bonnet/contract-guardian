-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public delete" ON public.contract_analyses;
DROP POLICY IF EXISTS "Allow public insert" ON public.contract_analyses;
DROP POLICY IF EXISTS "Allow public read" ON public.contract_analyses;
DROP POLICY IF EXISTS "Allow public update" ON public.contract_analyses;

-- Create permissive policies (these actually grant access)
CREATE POLICY "Allow all read access"
  ON public.contract_analyses
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert access"
  ON public.contract_analyses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update access"
  ON public.contract_analyses
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow all delete access"
  ON public.contract_analyses
  FOR DELETE
  USING (true);