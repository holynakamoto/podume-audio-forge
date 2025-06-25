
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Globe, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ResumeDataService } from '@/services/ResumeDataService';

interface UrlScraperProps {
  onContentExtracted: (content: string) => void;
  resumeContent: string;
}

export const UrlScraper: React.FC<UrlScraperProps> = ({
  onContentExtracted,
  resumeContent
}) => {
  const [url, setUrl] = useState('https://www.kickresume.com/edit/16086325/preview/');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [validationMessage, setValidationMessage] = useState('');
  const [extractionSource, setExtractionSource] = useState<string>('');

  const handleUrlValidation = async (inputUrl: string) => {
    const validation = await ResumeDataService.validateUrl(inputUrl);
    setValidationMessage(validation.message);
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      toast.error('Please enter a Kickresume URL');
      return;
    }

    setIsExtracting(true);
    setExtractionProgress(0);
    setExtractionSource('');

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      console.log('=== Starting hybrid extraction ===');
      const result = await ResumeDataService.extractResumeData(url);

      clearInterval(progressInterval);
      setExtractionProgress(100);

      if (result.success && result.data) {
        console.log('Extraction successful:', result.metadata);
        setExtractionSource(result.metadata?.extractionMethod || result.source);
        
        onContentExtracted(result.data);
        
        toast.success(
          `Resume extracted successfully via ${result.metadata?.extractionMethod || result.source}!`
        );
      } else {
        console.error('Extraction failed:', result.error);
        toast.error(result.error || 'Failed to extract resume content');
      }
    } catch (error) {
      console.error('Extraction error:', error);
      toast.error('An unexpected error occurred during extraction');
    } finally {
      setIsExtracting(false);
      setTimeout(() => setExtractionProgress(0), 3000);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    if (newUrl.trim()) {
      handleUrlValidation(newUrl);
    } else {
      setValidationMessage('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="kickresume-url" className="font-semibold">
          Kickresume URL
        </Label>
        <div className="mt-2 space-y-3">
          <Input
            id="kickresume-url"
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://www.kickresume.com/edit/16086325/preview/"
            className="w-full"
            disabled={isExtracting}
          />
          
          {validationMessage && (
            <Alert className="border-blue-200 bg-blue-50">
              <Globe className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                {validationMessage}
              </AlertDescription>
            </Alert>
          )}

          {isExtracting && (
            <div className="space-y-2">
              <Progress value={extractionProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Extracting resume content... {extractionProgress}%
              </p>
            </div>
          )}

          <Button
            onClick={handleExtract}
            disabled={isExtracting || !url.trim()}
            className="w-full"
          >
            {isExtracting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Extract from URL
              </>
            )}
          </Button>

          {extractionSource && resumeContent && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 text-sm">
                <div className="space-y-1">
                  <div><strong>Extraction successful!</strong></div>
                  <div>Method: {extractionSource}</div>
                  <div>Content length: {resumeContent.length} characters</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <div className="space-y-2">
            <p><strong>Supported URL formats:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
              <li>Preview URLs: /edit/{'{id}'}/preview/</li>
              <li>Public URLs: /cv/{'{id}'} or /resume/{'{id}'}</li>
            </ul>
            <p className="mt-2">
              <strong>Extraction methods:</strong> FireCrawl scraping (primary), 
              Kickresume API (when available)
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
