import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Loader2, Share, Download } from 'lucide-react';
import { voiceOptions } from './constants/voices';
import { useTTSGeneration } from './hooks/useTTSGeneration';
import { useSocialSharing } from './hooks/useSocialSharing';

interface TTSComparisonProps {
  transcript: string;
}

export const TTSComparison: React.FC<TTSComparisonProps> = ({ transcript }) => {
  const {
    selectedVoice,
    setSelectedVoice,
    audioState,
    generateTTS,
    playAudio,
    downloadAudio
  } = useTTSGeneration();
  
  const { shareToSocial } = useSocialSharing();


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎧 Generate Podcast Audio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a voice and generate high-quality audio from your transcript
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Voice</label>
            <Select onValueChange={(value) => {
              const voice = voiceOptions.find(v => `${v.provider}-${v.voiceId}` === value);
              setSelectedVoice(voice || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a voice for your podcast..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notebooklm-podcast-host">Podcast Host (NotebookLM Style) - Professional narrator</SelectItem>
                <SelectItem value="notebooklm-interviewer">Interviewer (NotebookLM Style) - Engaging conversational</SelectItem>
                <SelectItem value="deepgram-aura-asteria-en">Asteria (Deepgram) - Clear female</SelectItem>
                <SelectItem value="deepgram-aura-orpheus-en">Orpheus (Deepgram) - Smooth male</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={() => generateTTS(transcript)}
            disabled={audioState.isLoading || !selectedVoice}
            className="w-full"
            size="lg"
          >
            {audioState.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Audio...
              </>
            ) : (
              'Generate Podcast Audio'
            )}
          </Button>

          {/* Audio Player */}
          {audioState.audio && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Button
                  onClick={playAudio}
                  size="lg"
                  className="rounded-full w-12 h-12"
                >
                  {audioState.isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <div className="flex-1">
                  <p className="font-medium">Your LinkedIn Podcast</p>
                  <p className="text-sm text-muted-foreground">
                    Generated with {selectedVoice?.name}
                  </p>
                </div>
                <Button onClick={downloadAudio} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Social Sharing */}
              <div className="space-y-3">
                <h4 className="font-medium">Share Your Podcast</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => shareToSocial('twitter', !!audioState.audio)} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('linkedin', !!audioState.audio)} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('facebook', !!audioState.audio)} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-50 hover:bg-blue-100"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('copy', !!audioState.audio)} 
                    variant="outline" 
                    size="sm"
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm text-muted-foreground">
              <strong>Preview:</strong> "{transcript.substring(0, 150)}..."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};