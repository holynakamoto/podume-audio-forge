
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { extractTextFromPDF } from '@/utils/pdfExtractor';
import { ttsService, TTSOptions } from '@/utils/ttsService';
import { Upload, Play, Pause, Square, Volume2 } from 'lucide-react';

interface PDFToTTSProps {
  onTextExtracted?: (text: string) => void;
}

export const PDFToTTS: React.FC<PDFToTTSProps> = ({ onTextExtracted }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = ttsService.getAvailableVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer English voices)
      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('natural')
      ) || availableVoices.find(voice => voice.lang.startsWith('en')) || availableVoices[0];
      
      setSelectedVoice(englishVoice);
    };

    // Voices might not be loaded immediately
    if (voices.length === 0) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
      loadVoices();
    }

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [voices.length]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    setIsExtracting(true);
    setExtractProgress(0);
    
    try {
      const text = await extractTextFromPDF(file, setExtractProgress);
      setExtractedText(text);
      onTextExtracted?.(text);
      toast.success('PDF text extracted successfully!');
    } catch (error) {
      console.error('PDF extraction failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract text from PDF');
    } finally {
      setIsExtracting(false);
      event.target.value = '';
    }
  };

  const handlePlay = async () => {
    if (!extractedText) {
      toast.error('No text to read. Please upload a PDF first.');
      return;
    }

    if (isPaused) {
      ttsService.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    try {
      setIsPlaying(true);
      setIsPaused(false);
      
      const options: TTSOptions = {
        voice: selectedVoice,
        rate: rate[0],
        pitch: pitch[0],
        volume: volume[0]
      };

      await ttsService.speak(extractedText, options);
      setIsPlaying(false);
    } catch (error) {
      console.error('TTS failed:', error);
      toast.error('Failed to convert text to speech');
      setIsPlaying(false);
    }
  };

  const handlePause = () => {
    ttsService.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    ttsService.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>PDF to Text-to-Speech</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div>
          <Label className="font-semibold">Upload PDF Resume</Label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4 flex text-sm leading-6 text-gray-400">
                <label htmlFor="pdf-upload" className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
                  <span>{isExtracting ? `Extracting... ${extractProgress}%` : 'Upload PDF file'}</span>
                  <input 
                    id="pdf-upload" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileUpload}
                    accept=".pdf"
                    disabled={isExtracting}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-400">PDF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Text Preview */}
        {extractedText && (
          <div>
            <Label className="font-semibold">Extracted Text Preview</Label>
            <div className="mt-2 p-4 border rounded-lg max-h-32 overflow-y-auto text-sm text-gray-600">
              {extractedText.substring(0, 300)}...
            </div>
          </div>
        )}

        {/* TTS Controls */}
        {extractedText && (
          <div className="space-y-4">
            <Label className="font-semibold">Text-to-Speech Settings</Label>
            
            {/* Voice Selection */}
            <div>
              <Label className="text-sm">Voice</Label>
              <Select onValueChange={(value) => {
                const voice = voices.find(v => v.name === value);
                setSelectedVoice(voice || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rate Control */}
            <div>
              <Label className="text-sm">Speed: {rate[0]}x</Label>
              <Slider
                value={rate}
                onValueChange={setRate}
                max={2}
                min={0.5}
                step={0.1}
                className="mt-2"
              />
            </div>

            {/* Pitch Control */}
            <div>
              <Label className="text-sm">Pitch: {pitch[0]}</Label>
              <Slider
                value={pitch}
                onValueChange={setPitch}
                max={2}
                min={0.5}
                step={0.1}
                className="mt-2"
              />
            </div>

            {/* Volume Control */}
            <div>
              <Label className="text-sm">Volume: {Math.round(volume[0] * 100)}%</Label>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>

            {/* Playback Controls */}
            <div className="flex gap-2">
              <Button 
                onClick={handlePlay} 
                disabled={isPlaying && !isPaused}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-2" />
                {isPaused ? 'Resume' : 'Play'}
              </Button>
              <Button 
                onClick={handlePause} 
                disabled={!isPlaying || isPaused}
                variant="outline"
              >
                <Pause className="w-4 h-4" />
              </Button>
              <Button 
                onClick={handleStop} 
                disabled={!isPlaying && !isPaused}
                variant="outline"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
