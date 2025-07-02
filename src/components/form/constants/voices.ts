import { VoiceOption } from '../types/tts';

export const voiceOptions: VoiceOption[] = [
  // ElevenLabs voices (premium quality)
  { provider: 'elevenlabs', voiceId: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (ElevenLabs)', description: 'Professional female voice' },
  { provider: 'elevenlabs', voiceId: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (ElevenLabs)', description: 'Confident male voice' },
  { provider: 'elevenlabs', voiceId: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte (ElevenLabs)', description: 'Warm female voice' },
  { provider: 'elevenlabs', voiceId: 'JBFqnCBsd6RMkjVDRZzb', name: 'George (ElevenLabs)', description: 'Distinguished male voice' },
  
  // Deepgram voices (fast & natural)
  { provider: 'deepgram', voiceId: 'aura-asteria-en', name: 'Asteria (Deepgram)', description: 'Clear female voice' },
  { provider: 'deepgram', voiceId: 'aura-orpheus-en', name: 'Orpheus (Deepgram)', description: 'Smooth male voice' },
  
  // Cartesia voices (conversational)
  { provider: 'cartesia', voiceId: 'barbershop-man', name: 'Barbershop Man (Cartesia)', description: 'Casual male voice' },
  { provider: 'cartesia', voiceId: 'pleasant-female', name: 'Pleasant Female (Cartesia)', description: 'Friendly female voice' },
  
  // PlayHT voices (natural)
  { provider: 'playht', voiceId: 'jennifer', name: 'Jennifer (PlayHT)', description: 'Natural female voice' },
  { provider: 'playht', voiceId: 'mark', name: 'Mark (PlayHT)', description: 'Professional male voice' },
];