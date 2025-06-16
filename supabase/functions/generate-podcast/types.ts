
export interface PodcastRequest {
  resume_content: string;
  title: string;
  package_type?: string;
  voice_clone?: boolean;
  premium_assets?: boolean;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}
