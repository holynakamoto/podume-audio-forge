export interface VoiceOption {
  provider: 'elevenlabs' | 'deepgram' | 'cartesia' | 'playht' | 'notebooklm';
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