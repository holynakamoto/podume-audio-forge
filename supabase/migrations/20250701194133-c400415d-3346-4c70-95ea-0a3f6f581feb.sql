-- Create test_results table for storing test pipeline results
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_name TEXT NOT NULL,
  target_url TEXT,
  test_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  test_status TEXT NOT NULL CHECK (test_status IN ('SUCCESS', 'FAILURE', 'PENDING')),
  success_rate TEXT,
  validation_checks JSONB,
  profile_data JSONB,
  generated_script TEXT,
  audio_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on test_results
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for test_results (allowing public access for webhook testing)
CREATE POLICY "Allow public insert for test results" 
ON public.test_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read for test results" 
ON public.test_results 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_test_results_updated_at
BEFORE UPDATE ON public.test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();