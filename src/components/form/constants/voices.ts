import { VoiceOption } from '../types/tts';

export const voiceOptions: VoiceOption[] = [
  // Deepgram voices (working well)
  { provider: 'deepgram', voiceId: 'aura-asteria-en', name: 'Asteria (Deepgram)', description: 'Clear female voice' },
  { provider: 'deepgram', voiceId: 'aura-orpheus-en', name: 'Orpheus (Deepgram)', description: 'Smooth male voice' },
  { provider: 'deepgram', voiceId: 'aura-luna-en', name: 'Luna (Deepgram)', description: 'Warm female voice' },
  { provider: 'deepgram', voiceId: 'aura-stella-en', name: 'Stella (Deepgram)', description: 'Professional female voice' },
  
  // Eden AI TTS models (Multiple providers)
  { provider: 'edenai', voiceId: 'en-US-AriaNeural', name: 'Aria Neural (Eden AI)', description: 'Microsoft Azure female voice' },
  { provider: 'edenai', voiceId: 'en-US-GuyNeural', name: 'Guy Neural (Eden AI)', description: 'Microsoft Azure male voice' },
  { provider: 'edenai', voiceId: 'en-US-JennyNeural', name: 'Jenny Neural (Eden AI)', description: 'Microsoft Azure conversational female' },
  { provider: 'edenai', voiceId: 'en-US-DavisNeural', name: 'Davis Neural (Eden AI)', description: 'Microsoft Azure confident male' },
  { provider: 'edenai', voiceId: 'en-US-AmberNeural', name: 'Amber Neural (Eden AI)', description: 'Microsoft Azure warm female' },
  { provider: 'edenai', voiceId: 'en-US-AnaNeural', name: 'Ana Neural (Eden AI)', description: 'Microsoft Azure cheerful female' },
];