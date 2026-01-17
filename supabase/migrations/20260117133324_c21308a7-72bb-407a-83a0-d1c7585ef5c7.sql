-- Create table for contract analyses
CREATE TABLE public.contract_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contract_type TEXT DEFAULT 'Contrat',
  contract_text TEXT NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  verdict TEXT NOT NULL DEFAULT 'À analyser',
  red_flags JSONB DEFAULT '[]'::jsonb,
  standard_clauses JSONB DEFAULT '[]'::jsonb,
  resume TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_analyses ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (no auth yet)
CREATE POLICY "Allow public read" 
ON public.contract_analyses 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert" 
ON public.contract_analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update" 
ON public.contract_analyses 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete" 
ON public.contract_analyses 
FOR DELETE 
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contract_analyses_updated_at
BEFORE UPDATE ON public.contract_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();