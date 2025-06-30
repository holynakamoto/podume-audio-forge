
export interface PodcastRequest {
  title: string;
  package_type: string;
  voice_clone: boolean;
  premium_assets: boolean;
  resume_content: string;
  linkedin_url?: string;
  source_type: 'resume_content' | 'linkedin_url';
}

export interface PodcastData {
  id: string;
  title: string;
  transcript: string;
  audio_url?: string;
  linkedin_profile_data?: string;
  created_at: string;
  user_id: string;
  resume_content: string;
  status: string;
}
