export interface VoiceOption {
  provider: 'elevenlabs' | 'deepgram' | 'cartesia' | 'playht' | 'huggingface' | 'edenai' | 'golpoai';
  voiceId: string;
  name: string;
  description: string;
}

export interface AudioState {
  audio: string | null;
  isLoading: boolean;
  isPlaying: boolean;
  duration?: number;
}