
-- Clean up all duplicate RLS policies on podcasts table and implement secure access control
DROP POLICY IF EXISTS "Users can view their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can create their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can update their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can delete their own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public can view podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public can view completed podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Public can view shared podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can view own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can create own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can update own podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Users can delete own podcasts" ON public.podcasts;

-- Create a security definer function to check user ownership
CREATE OR REPLACE FUNCTION public.is_podcast_owner(podcast_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.podcasts 
    WHERE id = podcast_id AND podcasts.user_id = is_podcast_owner.user_id
  );
$$;

-- Create comprehensive and secure RLS policies
CREATE POLICY "authenticated_users_can_view_own_podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "public_can_view_shared_completed_podcasts" 
  ON public.podcasts 
  FOR SELECT 
  USING (is_public = true AND status = 'completed');

CREATE POLICY "authenticated_users_can_create_podcasts" 
  ON public.podcasts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "users_can_update_own_podcasts" 
  ON public.podcasts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "users_can_delete_own_podcasts" 
  ON public.podcasts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add input validation constraints
ALTER TABLE public.podcasts 
ADD CONSTRAINT check_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200);

ALTER TABLE public.podcasts 
ADD CONSTRAINT check_resume_content_length CHECK (char_length(resume_content) >= 5 AND char_length(resume_content) <= 50000);

ALTER TABLE public.podcasts 
ADD CONSTRAINT check_status_valid CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

ALTER TABLE public.podcasts 
ADD CONSTRAINT check_package_type_valid CHECK (package_type IN ('core', 'upsell'));

-- Ensure user_id is not nullable for security
ALTER TABLE public.podcasts 
ALTER COLUMN user_id SET NOT NULL;

-- Create audit logging table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  event_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow reading audit logs for admins (you can modify this later)
CREATE POLICY "audit_log_read_only" 
  ON public.security_audit_log 
  FOR SELECT 
  USING (false); -- No access for now, implement admin roles later

-- Allow system to insert audit logs
CREATE POLICY "system_can_insert_audit_logs" 
  ON public.security_audit_log 
  FOR INSERT 
  WITH CHECK (true);
