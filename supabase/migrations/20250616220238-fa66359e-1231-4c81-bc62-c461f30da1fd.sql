
-- Update the SELECT policy to allow public access to podcasts
-- This enables sharing functionality while keeping other operations secure
DROP POLICY IF EXISTS "Users can view their own podcasts" ON public.podcasts;

CREATE POLICY "Public can view podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (true);

-- Keep the other policies restrictive for authenticated users only
-- (INSERT, UPDATE, DELETE policies remain unchanged)
