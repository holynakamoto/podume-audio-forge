import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Loader2, Play, Square, Download, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ZapierNotebookLMProps {
  onAudioGenerated?: (audioUrl: string) => void;
}

export const ZapierNotebookLM: React.FC<ZapierNotebookLMProps> = ({ 
  onAudioGenerated 
}) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleTriggerZapier = async () => {
    if (!webhookUrl) {
      toast.error('Please enter your Zapier webhook URL');
      return;
    }

    if (!pdfFile) {
      toast.error('Please select a PDF file first');
      return;
    }

    setIsProcessing(true);
    console.log('Triggering Zapier NotebookLM automation:', webhookUrl);

    try {
      // Convert PDF to base64
      const arrayBuffer = await pdfFile.arrayBuffer();
      const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const payload = {
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        pdfContent: base64Content,
        timestamp: new Date().toISOString(),
        triggered_from: window.location.origin,
        requestType: 'notebooklm_automation'
      };

      console.log('Sending payload to Zapier webhook...');
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.audioContent) {
          // If Zapier returns audio content directly
          const audioDataUrl = `data:audio/mpeg;base64,${result.audioContent}`;
          setAudioUrl(audioDataUrl);
          
          if (onAudioGenerated) {
            onAudioGenerated(audioDataUrl);
          }
          
          toast.success('NotebookLM podcast generated successfully via Zapier!');
        } else {
          toast.success('Request sent to Zapier! Please check your Zap\'s history. Audio will be available when processing completes.');
        }
      } else {
        toast.error('Failed to trigger Zapier webhook. Please check the URL and try again.');
      }

    } catch (error) {
      console.error('Error triggering Zapier webhook:', error);
      toast.error('Failed to trigger the Zapier webhook. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.src = audioUrl;
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) {
      toast.error('No audio to download');
      return;
    }
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'notebooklm-podcast.mp3';
    link.click();
    toast.success('Audio download started!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ Zapier + NotebookLM Automation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload a PDF and trigger your Zapier automation for NotebookLM podcast generation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Setup Instructions */}
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Setup Required:</strong></p>
              <ol className="list-decimal list-inside ml-2 space-y-1 text-xs">
                <li>Create a new Zap in Zapier</li>
                <li>Add "Webhooks by Zapier" as the trigger</li>
                <li>Set up NotebookLM automation steps (upload PDF, generate podcast, return audio)</li>
                <li>Copy the webhook URL and paste it below</li>
              </ol>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
                className="mt-2"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Set up Zapier Webhook
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Webhook URL Input */}
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
          <Input
            id="webhook-url"
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://hooks.zapier.com/hooks/catch/..."
            disabled={isProcessing}
          />
        </div>

        {/* PDF Upload */}
        <div className="space-y-2">
          <Label htmlFor="pdf-upload">Upload PDF Document</Label>
          <div className="flex items-center gap-4">
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isProcessing}
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

        {/* Trigger Button */}
        <Button
          onClick={handleTriggerZapier}
          disabled={!pdfFile || !webhookUrl || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Triggering Zapier Automation...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Generate Podcast via Zapier
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
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
                <p className="font-medium">Zapier + NotebookLM Podcast</p>
                <p className="text-sm text-muted-foreground">
                  Generated via automated workflow
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

        {/* Payload Info */}
        <Alert>
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p><strong>Zapier will receive:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                <li><code>fileName</code> - Your PDF filename</li>
                <li><code>pdfContent</code> - Base64 encoded PDF data</li>
                <li><code>requestType</code> - "notebooklm_automation"</li>
                <li><code>timestamp</code> - When the request was sent</li>
              </ul>
              <p className="mt-2 text-xs">
                Your Zapier automation should return <code>audioContent</code> (base64 audio) for full integration.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};