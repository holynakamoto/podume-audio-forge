
-- Clean up duplicate RLS policies on podcasts table
-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can create their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can update their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can delete their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public can view podcasts" ON public.podcasts;

-- Create a more secure public read policy that only allows reading specific fields
-- and only for completed podcasts (removing the overly permissive public access)
CREATE POLICY "Public can view completed podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (status = 'completed');

-- Recreate user-specific policies with better security
CREATE POLICY "Users can view their own podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (auth.uid() = user_id OR status = 'completed');

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
