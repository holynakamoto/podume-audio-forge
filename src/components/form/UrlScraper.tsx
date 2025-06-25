
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Loader2, Globe, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UrlScraperProps {
  onContentExtracted: (content: string) => void;
  resumeContent: string;
}

export const UrlScraper: React.FC<UrlScraperProps> = ({ 
  onContentExtracted, 
  resumeContent 
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!FirecrawlService.validateUrl(url)) {
      toast.error('Please enter a valid URL (http:// or https://)');
      return;
    }

    setIsLoading(true);
    toast.info('Extracting content from URL...');

    try {
      const result = await FirecrawlService.scrapeUrl(url);
      
      if (result.success && result.data) {
        onContentExtracted(result.data);
        toast.success('Content extracted successfully from URL!');
      } else {
        toast.error(result.error || 'Failed to extract content from URL');
      }
    } catch (error) {
      console.error('Error scraping URL:', error);
      toast.error('Failed to extract content from URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="url-input" className="font-semibold">
          Extract from URL
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Enter a URL to your online resume, LinkedIn profile, or portfolio
        </p>
      </div>

      <Alert>
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <strong>Supported sources:</strong> LinkedIn profiles, personal websites, 
          online portfolios, resume hosting sites, and other web pages containing your resume content.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleScrape} className="space-y-4">
        <div className="flex gap-2">
          <Input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile or https://yourwebsite.com/resume"
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !url.trim()}
            className="px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Extract
              </>
            )}
          </Button>
        </div>
      </form>

      {resumeContent && (
        <div className="mt-4">
          <Label className="font-semibold">Extracted Content Preview</Label>
          <div className="mt-2 p-3 bg-muted rounded-md max-h-40 overflow-y-auto text-sm">
            {resumeContent.substring(0, 500)}
            {resumeContent.length > 500 && '...'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {resumeContent.length} characters extracted from URL
          </p>
        </div>
      )}
    </div>
  );
};
