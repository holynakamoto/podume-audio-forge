
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
      console.log('=== FireCrawl Debug Start ===');
      console.log('Calling FireCrawl edge function for URL:', url);
      
      // Check if it's a Kickresume URL and provide specific guidance
      if (url.includes('kickresume.com')) {
        console.log('Kickresume URL detected - should work with FireCrawl');
      }
      
      // Call our edge function instead of using the client directly
      const response = await fetch('/api/firecrawl-scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        
        // Handle specific restriction errors
        if (response.status === 403 || errorText.includes('Forbidden') || errorText.includes('no longer supported')) {
          return { 
            success: false, 
            error: 'Unable to access this resume URL. Please ensure your Kickresume is publicly accessible or try using the "Paste Text" option instead.' 
          };
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      // Get the raw response text first
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      console.log('Response text length:', responseText.length);
      
      // Check if response is empty
      if (!responseText || responseText.trim().length === 0) {
        console.error('Empty response from FireCrawl service');
        return { 
          success: false, 
          error: 'Empty response from scraping service' 
        };
      }

      // Check if response looks like HTML (common for error pages)
      if (responseText.trim().startsWith('<')) {
        console.error('Received HTML instead of JSON - likely an error page');
        
        // Check for specific restriction message
        if (responseText.includes('no longer supported') || responseText.includes('Forbidden')) {
          return { 
            success: false, 
            error: 'Unable to access this resume URL. Please ensure your Kickresume is publicly accessible or use the "Paste Text" option to manually enter your resume content.' 
          };
        }
        
        return { 
          success: false, 
          error: 'Received HTML error page instead of JSON response from scraping service' 
        };
      }

      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Successfully parsed JSON:', result);
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Failed to parse response as JSON. Raw text:', responseText);
        return { 
          success: false, 
          error: `Invalid JSON response from scraping service: ${jsonError.message}` 
        };
      }
      
      if (!result.success) {
        console.error('FireCrawl scraping failed:', result.error);
        
        // Handle restriction errors in the response
        if (result.error?.includes('Forbidden') || result.error?.includes('no longer supported')) {
          return { 
            success: false, 
            error: 'Unable to access this resume URL. Please ensure your Kickresume is publicly accessible or use the "Paste Text" option instead.' 
          };
        }
        
        return { 
          success: false, 
          error: result.error || 'Failed to scrape website' 
        };
      }

      console.log('FireCrawl scraping successful');
      console.log('=== FireCrawl Debug End ===');
      return { 
        success: true,
        data: result.data 
      };
    } catch (error) {
      console.error('=== FireCrawl Error ===');
      console.error('Error during FireCrawl scraping:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('=== End FireCrawl Error ===');
      
      // Handle restriction network errors
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        return { 
          success: false, 
          error: 'Unable to access this resume URL. Please ensure your Kickresume is publicly accessible or use the "Paste Text" option instead.' 
        };
      }
      
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
