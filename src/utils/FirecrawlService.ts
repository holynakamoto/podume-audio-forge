
import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlResponse {
  success: true;
  data: {
    markdown?: string;
    html?: string;
    metadata?: {
      title?: string;
      description?: string;
    };
  };
}

type FirecrawlResult = CrawlResponse | ErrorResponse;

export class FirecrawlService {
  private static firecrawlApp: FirecrawlApp | null = null;

  static async initializeWithServerKey(): Promise<boolean> {
    try {
      // This will be called from the edge function with the server-side API key
      return true;
    } catch (error) {
      console.error('Error initializing FireCrawl:', error);
      return false;
    }
  }

  static async scrapeUrl(url: string): Promise<{ success: boolean; error?: string; data?: string }> {
    try {
      console.log('Calling FireCrawl edge function for URL:', url);
      
      // Call our edge function instead of using the client directly
      const response = await fetch('/api/firecrawl-scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('FireCrawl scraping failed:', result.error);
        return { 
          success: false, 
          error: result.error || 'Failed to scrape website' 
        };
      }

      console.log('FireCrawl scraping successful');
      return { 
        success: true,
        data: result.data 
      };
    } catch (error) {
      console.error('Error during FireCrawl scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to scraping service' 
      };
    }
  }

  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
