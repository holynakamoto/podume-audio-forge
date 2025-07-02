import { VoiceOption } from '../types/tts';

export const voiceOptions: VoiceOption[] = [
  // Google NotebookLM style (highest quality)
  { provider: 'notebooklm', voiceId: 'podcast-host', name: 'Podcast Host (NotebookLM Style)', description: 'Professional podcast narrator' },
  { provider: 'notebooklm', voiceId: 'interviewer', name: 'Interviewer (NotebookLM Style)', description: 'Engaging conversational voice' },
  
  // Deepgram voices (working well)
  { provider: 'deepgram', voiceId: 'aura-asteria-en', name: 'Asteria (Deepgram)', description: 'Clear female voice' },
  { provider: 'deepgram', voiceId: 'aura-orpheus-en', name: 'Orpheus (Deepgram)', description: 'Smooth male voice' },
];