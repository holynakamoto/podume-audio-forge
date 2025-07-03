-- Phase 1: Critical RLS Policy Fixes

-- Add RLS policies for podcast_jobs table
ALTER TABLE public.podcast_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own podcast jobs
CREATE POLICY "Users can view own podcast jobs" 
ON public.podcast_jobs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid()
  )
);

-- Users can only insert their own podcast jobs (if user_id column exists)
-- Note: This table doesn't have user_id, so we'll add it first
ALTER TABLE public.podcast_jobs 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update the policy to use user_id
DROP POLICY IF EXISTS "Users can view own podcast jobs" ON public.podcast_jobs;
CREATE POLICY "Users can view own podcast jobs" 
ON public.podcast_jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own podcast jobs" 
ON public.podcast_jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own podcast jobs" 
ON public.podcast_jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add RLS policies for workflow_logs table
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view logs for their own podcast jobs
CREATE POLICY "Users can view own workflow logs" 
ON public.workflow_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.podcast_jobs 
    WHERE podcast_jobs.id = workflow_logs.job_id 
    AND podcast_jobs.user_id = auth.uid()
  )
);

-- Only system can insert workflow logs
CREATE POLICY "System can insert workflow logs" 
ON public.workflow_logs 
FOR INSERT 
WITH CHECK (true);

-- Enhanced security audit logging with better structure
ALTER TABLE public.security_audit_log 
ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low',
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS action_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS geo_location JSONB;

-- Create index for better performance on security queries
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON public.security_audit_log(created_at);

-- Create a function to safely log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}',
  p_risk_level TEXT DEFAULT 'low',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    event_type,
    user_id,
    event_data,
    risk_level,
    ip_address,
    user_agent,
    action_details
  ) VALUES (
    p_event_type,
    COALESCE(p_user_id, auth.uid()),
    p_event_data,
    p_risk_level,
    p_ip_address,
    p_user_agent,
    jsonb_build_object(
      'timestamp', now(),
      'function_called', 'log_security_event'
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;