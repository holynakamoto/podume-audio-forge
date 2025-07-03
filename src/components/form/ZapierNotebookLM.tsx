import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Loader2, Play, Square, Download, ExternalLink, CheckCircle, AlertTriangle, Globe, FileText, Volume2, Share2, Twitter, Linkedin, Facebook, Copy, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ZapierNotebookLMProps {
  onAudioGenerated?: (audioUrl: string) => void;
}

export const ZapierNotebookLM: React.FC<ZapierNotebookLMProps> = ({ 
  onAudioGenerated 
}) => {
  // State management
  const [inputMode, setInputMode] = useState<'pdf' | 'url' | 'text'>('pdf');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [urlToScrape, setUrlToScrape] = useState('');
  const [textContent, setTextContent] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [firecrawlApiKey, setFirecrawlApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingMode, setProcessingMode] = useState<'standard' | 'advanced'>('standard');

  // Load saved settings from localStorage
  useEffect(() => {
    const savedWebhookUrl = localStorage.getItem('zapier_webhook_url');
    const savedApiKey = localStorage.getItem('firecrawl_api_key');
    if (savedWebhookUrl) setWebhookUrl(savedWebhookUrl);
    if (savedApiKey) setFirecrawlApiKey(savedApiKey);
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('zapier_webhook_url', webhookUrl);
    }
  }, [webhookUrl]);

  useEffect(() => {
    if (firecrawlApiKey) {
      localStorage.setItem('firecrawl_api_key', firecrawlApiKey);
    }
  }, [firecrawlApiKey]);

  // Validation functions
  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!webhookUrl) {
      newErrors.webhookUrl = 'Zapier webhook URL is required';
    } else if (!webhookUrl.includes('hooks.zapier.com')) {
      newErrors.webhookUrl = 'Please enter a valid Zapier webhook URL';
    }

    if (inputMode === 'pdf' && !pdfFile) {
      newErrors.pdfFile = 'Please select a PDF file';
    } else if (inputMode === 'pdf' && pdfFile && pdfFile.size > 200 * 1024 * 1024) {
      newErrors.pdfFile = 'PDF file must be less than 200MB (NotebookLM limit)';
    }

    if (inputMode === 'url' && !urlToScrape) {
      newErrors.urlToScrape = 'Please enter a URL to scrape';
    } else if (inputMode === 'url' && urlToScrape) {
      try {
        new URL(urlToScrape);
      } catch {
        newErrors.urlToScrape = 'Please enter a valid URL';
      }
    }

    if (inputMode === 'text' && !textContent.trim()) {
      newErrors.textContent = 'Please enter text content';
    } else if (inputMode === 'text' && textContent.length > 50000) {
      newErrors.textContent = 'Text content must be less than 50,000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrors(prev => ({ ...prev, pdfFile: 'Please select a PDF file' }));
        return;
      }
      if (file.size > 200 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, pdfFile: 'PDF file must be less than 200MB (NotebookLM limit)' }));
        return;
      }
      setPdfFile(file);
      setErrors(prev => ({ ...prev, pdfFile: '' }));
      toast.success(`PDF selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    }
  };

  const handleScrapeUrl = async (): Promise<string> => {
    setCurrentStep('Scraping URL content...');
    setProgress(20);

    try {
      // Simple URL scraping without external dependencies
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(urlToScrape)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL content');
      }

      const htmlContent = await response.text();
      setProgress(40);
      
      // Basic HTML to text conversion
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Create a text file for Zapier
      const textBlob = new Blob([`URL: ${urlToScrape}\n\nContent:\n${textContent}`], { type: 'text/plain' });
      const base64Content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(textBlob);
      });

      return base64Content;
    } catch (error) {
      throw new Error(`URL scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createTextFile = async (text: string): Promise<string> => {
    setCurrentStep('Preparing text content...');
    setProgress(30);
    
    // Convert text to file for Zapier
    const textBlob = new Blob([text], { type: 'text/plain' });
    const base64Content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(textBlob);
    });

    return base64Content;
  };

  const handleTriggerZapier = async () => {
    if (!validateInputs()) {
      toast.error('Please fix the errors above');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Initializing...');
    
    try {
      let base64Content: string;
      let fileName: string;
      let fileType = 'application/pdf';

      setProgress(10);

      if (inputMode === 'pdf' && pdfFile) {
        setCurrentStep('Processing PDF file...');
        const arrayBuffer = await pdfFile.arrayBuffer();
        base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        fileName = pdfFile.name;
        setProgress(50);
      } else if (inputMode === 'url') {
        base64Content = await handleScrapeUrl();
        fileName = `scraped-content-${Date.now()}.txt`;
        fileType = 'text/plain';
        setProgress(60);
      } else if (inputMode === 'text') {
        base64Content = await createTextFile(textContent);
        fileName = `text-content-${Date.now()}.txt`;
        fileType = 'text/plain';
        setProgress(50);
      } else {
        throw new Error('No valid input provided');
      }

      setCurrentStep('Sending to Zapier...');
      setProgress(70);

      const payload = {
        fileName,
        fileData: base64Content,
        fileType,
        fileSize: inputMode === 'pdf' ? pdfFile?.size : base64Content.length,
        inputMode,
        sourceUrl: inputMode === 'url' ? urlToScrape : undefined,
        timestamp: new Date().toISOString(),
        triggered_from: window.location.origin,
        requestType: 'notebooklm_automation',
        processingMode
      };

      console.log('Sending payload to Zapier webhook:', { ...payload, fileData: '[base64 data]' });
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setProgress(90);

      if (response.ok) {
        let result;
        try {
          result = await response.json();
        } catch {
          result = {};
        }
        
        setProgress(100);
        setCurrentStep('Complete!');
        
        if (result.audioContent) {
          // If Zapier returns audio content directly
          const audioDataUrl = `data:audio/mpeg;base64,${result.audioContent}`;
          setAudioUrl(audioDataUrl);
          
          if (onAudioGenerated) {
            onAudioGenerated(audioDataUrl);
          }
          
          toast.success('NotebookLM podcast generated successfully via Zapier!');
        } else if (result.driveFileUrl) {
          toast.success(`Content uploaded to Google Drive! Import to NotebookLM: ${result.driveFileUrl}`);
        } else {
          toast.success('Request sent to Zapier! Check your Zap\'s history. Import the file from Google Drive to NotebookLM.');
        }
      } else {
        const errorText = await response.text();
        console.error('Zapier webhook error:', errorText);
        toast.error('Failed to trigger Zapier webhook. Please check the URL and try again.');
      }

    } catch (error) {
      console.error('Error triggering Zapier webhook:', error);
      toast.error(`Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress(0);
      setCurrentStep('');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setCurrentStep('');
      }, 3000);
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

  const shareToSocial = (platform: string) => {
    if (!audioUrl) {
      toast.error('Generate audio first to share');
      return;
    }
    
    const shareText = `Check out my AI-generated podcast from NotebookLM! 🎧 #NotebookLM #AI #Podcast`;
    const shareUrl = window.location.href;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      default:
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⚡ Zapier + NotebookLM Automation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automate content preparation for Google NotebookLM podcast generation
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Setup Instructions */}
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p><strong>Quick Setup:</strong></p>
              <ol className="list-decimal list-inside ml-2 space-y-1 text-xs">
                <li>Create a Zap: Webhook trigger → Code (decode base64) → Google Drive upload</li>
                <li>Optional: Add NotebookLM automation steps</li>
                <li>Copy webhook URL below</li>
                <li>Upload content and trigger the automation</li>
              </ol>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Set up Zapier
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://notebooklm.google.com', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open NotebookLM
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Input Mode Selection */}
        <div className="space-y-2">
          <Label>Content Source</Label>
          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'pdf' | 'url' | 'text')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pdf" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                PDF Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                URL Scrape
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Text Input
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pdf-upload">Upload PDF Document (Max 200MB)</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
                {errors.pdfFile && (
                  <p className="text-sm text-destructive">{errors.pdfFile}</p>
                )}
                {pdfFile && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="w-4 h-4" />
                    {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)}MB)
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-input">Website URL to Scrape</Label>
                <Input
                  id="url-input"
                  type="url"
                  value={urlToScrape}
                  onChange={(e) => setUrlToScrape(e.target.value)}
                  placeholder="https://example.com/article"
                  disabled={isProcessing}
                />
                {errors.urlToScrape && (
                  <p className="text-sm text-destructive">{errors.urlToScrape}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  The page content will be extracted and converted to text for NotebookLM
                </p>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Text Content</Label>
                <Textarea
                  id="text-input"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here..."
                  disabled={isProcessing}
                  rows={6}
                  maxLength={50000}
                />
                {errors.textContent && (
                  <p className="text-sm text-destructive">{errors.textContent}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {textContent.length}/50,000 characters
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator />

        {/* Zapier Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Zapier Webhook URL *</Label>
            <Input
              id="webhook-url"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              disabled={isProcessing}
            />
            {errors.webhookUrl && (
              <p className="text-sm text-destructive">{errors.webhookUrl}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="processing-mode">Processing Mode</Label>
            <Select value={processingMode} onValueChange={(value) => setProcessingMode(value as 'standard' | 'advanced')}>
              <SelectTrigger>
                <SelectValue placeholder="Select processing mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Upload to Drive only)</SelectItem>
                <SelectItem value="advanced">Advanced (Full NotebookLM automation)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {processingMode === 'standard' 
                ? 'Uploads content to Google Drive for manual NotebookLM import'
                : 'Attempts full automation including NotebookLM processing (requires advanced Zapier setup)'
              }
            </p>
          </div>
        </div>

        {/* Progress Display */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{currentStep}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Trigger Button */}
        <Button
          onClick={handleTriggerZapier}
          disabled={isProcessing || !webhookUrl}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {currentStep || 'Processing...'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Send to NotebookLM via Zapier
            </>
          )}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Generated Podcast
              </h3>
              
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Button
                  onClick={playAudio}
                  size="lg"
                  className="rounded-full w-12 h-12"
                  variant="default"
                >
                  {isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <div className="flex-1">
                  <p className="font-medium">NotebookLM Podcast</p>
                  <p className="text-sm text-muted-foreground">
                    Generated via Zapier automation
                  </p>
                </div>
                <Button onClick={downloadAudio} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Social Sharing */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Your Podcast
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => shareToSocial('twitter')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('linkedin')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('facebook')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button 
                    onClick={() => shareToSocial('copy')} 
                    variant="outline" 
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your podcast has been generated! You can now use all sharing and distribution features.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Technical Details */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p><strong>What Zapier receives:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                <li><code>fileName</code> - Your file name</li>
                <li><code>fileData</code> - Base64 encoded content</li>
                <li><code>fileType</code> - MIME type (PDF or text)</li>
                <li><code>inputMode</code> - Source type (pdf/url/text)</li>
                <li><code>processingMode</code> - Standard or advanced</li>
                <li><code>timestamp</code> - When request was sent</li>
              </ul>
              <p className="mt-2 text-xs">
                For full integration, your Zapier automation should return <code>audioContent</code> (base64 audio) 
                or <code>driveFileUrl</code> for the uploaded file.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};