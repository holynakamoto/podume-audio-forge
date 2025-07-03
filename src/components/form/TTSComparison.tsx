import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, Loader2, Download, Twitter, Linkedin, Facebook, Copy } from 'lucide-react';
import { voiceOptions } from './constants/voices';
import { useTTSGeneration } from './hooks/useTTSGeneration';
import { useSocialSharing } from './hooks/useSocialSharing';

interface TTSComparisonProps {
  transcript: string;
  onAudioGenerated?: (audioUrl: string) => void;
}

export const TTSComparison: React.FC<TTSComparisonProps> = ({ transcript, onAudioGenerated }) => {
  const {
    selectedVoice,
    setSelectedVoice,
    audioState,
    generateTTS,
    playAudio,
    downloadAudio
  } = useTTSGeneration();

  // Notify parent when audio is generated
  React.useEffect(() => {
    if (audioState.audio && onAudioGenerated) {
      onAudioGenerated(audioState.audio);
    }
  }, [audioState.audio, onAudioGenerated]);
  
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
          {/* Dual Voice Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Host 1 Voice</label>
              <Select defaultValue="nova">
                <SelectTrigger>
                  <SelectValue placeholder="Choose voice for Host 1..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nova">Nova - Energetic female</SelectItem>
                  <SelectItem value="alloy">Alloy - Professional neutral</SelectItem>
                  <SelectItem value="echo">Echo - Clear male</SelectItem>
                  <SelectItem value="fable">Fable - Warm male</SelectItem>
                  <SelectItem value="onyx">Onyx - Deep male</SelectItem>
                  <SelectItem value="shimmer">Shimmer - Bright female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Host 2 Voice</label>
              <Select defaultValue="alloy">
                <SelectTrigger>
                  <SelectValue placeholder="Choose voice for Host 2..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">Alloy - Professional neutral</SelectItem>
                  <SelectItem value="nova">Nova - Energetic female</SelectItem>
                  <SelectItem value="echo">Echo - Clear male</SelectItem>
                  <SelectItem value="fable">Fable - Warm male</SelectItem>
                  <SelectItem value="onyx">Onyx - Deep male</SelectItem>
                  <SelectItem value="shimmer">Shimmer - Bright female</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('linkedin', !!audioState.audio)} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-800 hover:bg-blue-900 text-white border-blue-800 hover:border-blue-900"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('facebook', !!audioState.audio)} 
                    variant="outline" 
                    size="sm"
                    className="bg-blue-700 hover:bg-blue-800 text-white border-blue-700 hover:border-blue-800"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('copy', !!audioState.audio)} 
                    variant="outline" 
                    size="sm"
                    className="bg-gray-600 hover:bg-gray-700 text-white border-gray-600 hover:border-gray-700"
                  >
                    <Copy className="w-4 h-4 mr-2" />
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