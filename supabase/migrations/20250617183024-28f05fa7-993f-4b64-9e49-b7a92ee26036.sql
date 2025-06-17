
-- Clean up duplicate RLS policies on podcasts table and implement secure public access
-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can create their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can update their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can delete their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public can view podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public can view completed podcasts" ON public.podcasts;

-- Add a sharing column to control public access
ALTER TABLE public.podcasts 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Create secure RLS policies with proper public access control
CREATE POLICY "Users can view their own podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (is_public = true AND status = 'completed');

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

-- Create an index for performance on public queries
CREATE INDEX IF NOT EXISTS idx_podcasts_public_status 
  ON public.podcasts (is_public, status) 
  WHERE is_public = true AND status = 'completed';
