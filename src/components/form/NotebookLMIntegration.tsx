import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, Play, Square, Download, Lock, CheckCircle } from 'lucide-react';
import { useNotebookLMIntegration } from './hooks/useNotebookLMIntegration';
import { toast } from 'sonner';

interface NotebookLMIntegrationProps {
  onAudioGenerated?: (audioUrl: string) => void;
}

export const NotebookLMIntegration: React.FC<NotebookLMIntegrationProps> = ({ 
  onAudioGenerated 
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  const { state, generatePodcastWithNotebookLM, resetState } = useNotebookLMIntegration();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setPdfFile(file);
      resetState();
    }
  };

  const handleGenerate = async () => {
    if (!pdfFile) {
      toast.error('Please select a PDF file first');
      return;
    }

    const credentials = showCredentials && googleEmail && googlePassword 
      ? { email: googleEmail, password: googlePassword }
      : undefined;

    const result = await generatePodcastWithNotebookLM(pdfFile, credentials);
    
    if (result.success && result.audioUrl && onAudioGenerated) {
      onAudioGenerated(result.audioUrl);
    }
  };

  const playAudio = () => {
    if (!state.audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = state.audioUrl;
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const downloadAudio = () => {
    if (!state.audioUrl) {
      toast.error('No audio to download');
      return;
    }
    
    const link = document.createElement('a');
    link.href = state.audioUrl;
    link.download = 'notebooklm-podcast.mp3';
    link.click();
    toast.success('Audio download started!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤖 NotebookLM Automated Podcast Generation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a PDF and automatically generate a podcast using Google NotebookLM
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PDF Upload */}
        <div className="space-y-2">
          <Label htmlFor="pdf-upload">Upload PDF Document</Label>
          <div className="flex items-center gap-4">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={state.isProcessing}
              className="flex-1"
            />
            {pdfFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                {pdfFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Google Credentials (Optional) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCredentials(!showCredentials)}
              className="flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {showCredentials ? 'Hide' : 'Add'} Google Credentials
            </Button>
            <span className="text-xs text-muted-foreground">(Optional - for private notebooks)</span>
          </div>

          {showCredentials && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="google-email">Google Email</Label>
                <Input
                  id="google-email"
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  disabled={state.isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-password">Google Password</Label>
                <Input
                  id="google-password"
                  type="password"
                  value={googlePassword}
                  onChange={(e) => setGooglePassword(e.target.value)}
                  placeholder="Your Google password"
                  disabled={state.isProcessing}
                />
              </div>
              <div className="col-span-full">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Credentials are only used for automation and are not stored. Required only if you need to access private NotebookLM notebooks.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </div>

        {/* Progress Display */}
        {state.isProcessing && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{state.currentStep}</span>
              <span>{state.progress}%</span>
            </div>
            <Progress value={state.progress} className="w-full" />
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                This process may take 2-5 minutes. We're automating the entire NotebookLM workflow for you.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!pdfFile || state.isProcessing}
          className="w-full"
          size="lg"
        >
          {state.isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {state.currentStep || 'Processing...'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Generate Podcast with NotebookLM
            </>
          )}
        </Button>

        {/* Audio Player */}
        {state.audioUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Button
                onClick={playAudio}
                size="lg"
                className="rounded-full w-12 h-12"
              >
                {isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <div className="flex-1">
                <p className="font-medium">NotebookLM Generated Podcast</p>
                <p className="text-sm text-muted-foreground">
                  Ready for sharing and distribution
                </p>
              </div>
              <Button onClick={downloadAudio} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your podcast has been generated! You can now use all sharing and distribution features.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Info Alert */}
        <Alert>
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p><strong>How it works:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                <li>Automated browser uploads your PDF to Google NotebookLM</li>
                <li>NotebookLM generates a conversational podcast automatically</li>
                <li>System downloads the audio and integrates it with your sharing features</li>
                <li>Complete automation - no manual steps required!</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};