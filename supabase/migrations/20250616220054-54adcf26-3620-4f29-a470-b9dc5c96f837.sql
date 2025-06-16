
-- Enable RLS on podcasts table if not already enabled
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can create their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can update their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can delete their own podcasts" ON public.podcasts;

-- Create policies for podcasts table
CREATE POLICY "Users can view their own podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own podcasts" 
  ON public.podcasts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcasts" 
  ON public.podcasts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own podcasts" 
  ON public.podcasts 
  FOR DELETE 
  USING (auth.uid() = user_id);
