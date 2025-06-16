
export interface TTSOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class TTSService {
  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any current speech
      this.stop();

      this.utterance = new SpeechSynthesisUtterance(text);
      
      // Set options
      if (options.voice) {
        this.utterance.voice = options.voice;
      }
      this.utterance.rate = options.rate || 1;
      this.utterance.pitch = options.pitch || 1;
      this.utterance.volume = options.volume || 1;

      // Set up event handlers
      this.utterance.onend = () => resolve();
      this.utterance.onerror = (event) => reject(new Error(`TTS Error: ${event.error}`));

      // Start speaking
      this.synthesis.speak(this.utterance);
    });
  }

  pause(): void {
    this.synthesis.pause();
  }

  resume(): void {
    this.synthesis.resume();
  }

  stop(): void {
    this.synthesis.cancel();
    this.utterance = null;
  }

  get isPaused(): boolean {
    return this.synthesis.paused;
  }

  get isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
}

export const ttsService = new TTSService();
