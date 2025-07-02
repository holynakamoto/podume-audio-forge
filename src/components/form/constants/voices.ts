import { VoiceOption } from '../types/tts';

export const voiceOptions: VoiceOption[] = [
  // Deepgram voices (working well)
  { provider: 'deepgram', voiceId: 'aura-asteria-en', name: 'Asteria (Deepgram)', description: 'Clear female voice' },
  { provider: 'deepgram', voiceId: 'aura-orpheus-en', name: 'Orpheus (Deepgram)', description: 'Smooth male voice' },
  { provider: 'deepgram', voiceId: 'aura-luna-en', name: 'Luna (Deepgram)', description: 'Warm female voice' },
  { provider: 'deepgram', voiceId: 'aura-stella-en', name: 'Stella (Deepgram)', description: 'Professional female voice' },
  
  // Hugging Face TTS models
  { provider: 'huggingface', voiceId: 'microsoft/speecht5_tts', name: 'SpeechT5 (Microsoft)', description: 'High-quality neural TTS' },
  { provider: 'huggingface', voiceId: 'facebook/mms-tts-eng', name: 'MMS English (Meta)', description: 'Multilingual speech synthesis' },
  { provider: 'huggingface', voiceId: 'suno/bark', name: 'Bark (Suno)', description: 'Expressive multilingual TTS' },
  { provider: 'huggingface', voiceId: 'espnet/kan-bayashi_ljspeech_vits', name: 'VITS LJSpeech', description: 'Fast parallel TTS' },
  { provider: 'huggingface', voiceId: 'facebook/fastspeech2-en-ljspeech', name: 'FastSpeech2 (Meta)', description: 'Fast and stable TTS' },
  { provider: 'huggingface', voiceId: 'microsoft/DiT-TTS_LibriTTS_R', name: 'DiT-TTS (Microsoft)', description: 'Diffusion-based TTS' },
  { provider: 'huggingface', voiceId: 'parler-tts/parler_tts_mini_v0.1', name: 'Parler TTS Mini', description: 'Controllable TTS model' },
  { provider: 'huggingface', voiceId: 'myshell-ai/MeloTTS-English', name: 'MeloTTS English', description: 'High-quality multilingual TTS' },
];