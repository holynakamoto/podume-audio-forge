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
      
      // Enhanced URL validation for Kickresume
      if (!this.validateKickresume(url)) {
        return { 
          success: false, 
          error: 'Please provide a valid Kickresume URL (e.g., https://www.kickresume.com/edit/123/preview/)' 
        };
      }
      
      // Call our edge function
      const response = await fetch(`https://pudwgzutzoidxbvozhnk.supabase.co/functions/v1/firecrawl-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZHdnenV0em9pZHhidm96aG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDg4NzQsImV4cCI6MjA2NTQ4NDg3NH0.kh_J0YvR52AkzSdajkyjGyae1W9NRD_Av4EGqQtS6Xo`,
        },
        body: JSON.stringify({ url }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        
        // Enhanced error handling for HTML responses
        if (errorText.trim().startsWith('<') || errorText.includes('<!DOCTYPE')) {
          console.error('Received HTML error page instead of JSON');
          return { 
            success: false, 
            error: 'Service temporarily unavailable. This might be due to Kickresume access restrictions or server issues.' 
          };
        }
        
        if (response.status === 403 || errorText.includes('Forbidden')) {
          return { 
            success: false, 
            error: 'Access denied to this Kickresume. Please ensure your resume is publicly accessible or use a preview URL.' 
          };
        }
        
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Raw response text length:', responseText.length);
      
      if (!responseText || responseText.trim().length === 0) {
        console.error('Empty response from FireCrawl service');
        return { 
          success: false, 
          error: 'Empty response from scraping service' 
        };
      }

      // Enhanced JSON parsing with better error handling
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Successfully parsed JSON response');
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        
        if (responseText.trim().startsWith('<')) {
          return { 
            success: false, 
            error: 'Received HTML instead of expected data. The URL might be private or inaccessible.' 
          };
        }
        
        return { 
          success: false, 
          error: 'Invalid response format from scraping service.' 
        };
      }
      
      if (!result.success) {
        console.error('FireCrawl scraping failed:', result.error);
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
      
      if (error.message?.includes('Unexpected token') && error.message?.includes('<')) {
        return { 
          success: false, 
          error: 'Service temporarily unavailable. Please try again later or use the "Paste Text" option.' 
        };
      }
      
      if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        return { 
          success: false, 
          error: 'Unable to access this Kickresume URL. Please ensure it is publicly accessible.' 
        };
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to scraping service' 
      };
    }
  }

  // Enhanced Kickresume URL validation
  static validateKickresume(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Must be HTTPS
      if (urlObj.protocol !== 'https:') {
        return false;
      }
      
      // Must be Kickresume domain
      if (!urlObj.hostname.includes('kickresume.com')) {
        return false;
      }
      
      // Check for common Kickresume URL patterns
      const pathname = urlObj.pathname;
      
      // Preview URLs: /edit/{id}/preview/
      if (pathname.match(/\/edit\/\d+\/preview\/?$/)) {
        return true;
      }
      
      // Public URLs: /cv/{id} or /resume/{id}
      if (pathname.match(/\/(cv|resume)\/\d+\/?$/)) {
        return true;
      }
      
      // Other Kickresume URLs might be valid too
      return pathname.length > 1; // Has some path
      
    } catch {
      return false;
    }
  }

  static validateUrl(url: string): boolean {
    return this.validateKickresume(url);
  }
}
