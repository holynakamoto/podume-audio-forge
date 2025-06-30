
-- Create podcast_jobs table for tracking workflow state
CREATE TABLE podcast_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending',
  linkedin_profile_url text NOT NULL,
  profile_data jsonb,
  transcript text,
  audio_url text,
  metadata jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_podcast_jobs_status ON podcast_jobs(status);
CREATE INDEX idx_podcast_jobs_created_at ON podcast_jobs(created_at);

-- Create workflow_logs table for detailed step tracking
CREATE TABLE workflow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES podcast_jobs(id),
  step_name text NOT NULL,
  status text NOT NULL,
  data jsonb,
  execution_time_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Create storage bucket for podcast audio files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcasts', 'podcasts', true);

-- Create storage policies for the podcasts bucket
CREATE POLICY "Anyone can view podcast files" ON storage.objects
FOR SELECT USING (bucket_id = 'podcasts');

CREATE POLICY "Service role can manage podcast files" ON storage.objects
FOR ALL USING (bucket_id = 'podcasts');
