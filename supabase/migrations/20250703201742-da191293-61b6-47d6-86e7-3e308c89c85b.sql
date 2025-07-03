-- Create audio_files table for storing NotebookLM generated audio
CREATE TABLE public.audio_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  source_pdf TEXT,
  supabase_url TEXT,
  google_drive_file_id TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own audio files" 
ON public.audio_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view published audio files" 
ON public.audio_files 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Users can create their own audio files" 
ON public.audio_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audio files" 
ON public.audio_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio files" 
ON public.audio_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_audio_files_updated_at
BEFORE UPDATE ON public.audio_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);

-- Create storage policies for audio files
CREATE POLICY "Users can view their own audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view published audio files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'audio-files' AND EXISTS (
  SELECT 1 FROM public.audio_files 
  WHERE supabase_url LIKE '%' || objects.name || '%' AND is_published = true
));

CREATE POLICY "Users can upload their own audio files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audio files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audio files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);