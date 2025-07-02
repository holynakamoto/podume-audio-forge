import { VoiceOption } from '../types/tts';

export const voiceOptions: VoiceOption[] = [
  // Deepgram voices (working well)
  { provider: 'deepgram', voiceId: 'aura-asteria-en', name: 'Asteria (Deepgram)', description: 'Clear female voice' },
  { provider: 'deepgram', voiceId: 'aura-orpheus-en', name: 'Orpheus (Deepgram)', description: 'Smooth male voice' },
  { provider: 'deepgram', voiceId: 'aura-luna-en', name: 'Luna (Deepgram)', description: 'Warm female voice' },
  { provider: 'deepgram', voiceId: 'aura-stella-en', name: 'Stella (Deepgram)', description: 'Professional female voice' },
];