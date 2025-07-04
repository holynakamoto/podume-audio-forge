
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
      console.log('Attempting to scrape URL:', url);
      
      // Basic URL validation - accept any valid URL
      if (!this.validateUrl(url)) {
        console.log('URL validation failed for:', url);
        return { 
          success: false, 
          error: 'Please provide a valid URL' 
        };
      }
      
      console.log('URL validation passed, calling edge function...');
      
      // Call our edge function
      const response = await fetch(`https://pudwgzutzoidxbvozhnk.supabase.co/functions/v1/firecrawl-scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1ZHdnenV0em9pZHhidm96aG5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDg4NzQsImV4cCI6MjA2NTQ4NDg3NH0.kh_J0YvR52AkzSdajkyjGyae1W9NRD_Av4EGqQtS6Xo`,
        },
        body: JSON.stringify({ url }),
      });

      console.log('Edge function response status:', response.status);
      console.log('Edge function response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        // Enhanced error handling for HTML responses
        if (errorText.trim().startsWith('<') || errorText.includes('<!DOCTYPE')) {
          console.error('Received HTML error page instead of JSON');
          return { 
            success: false, 
            error: 'Service temporarily unavailable. This might be due to access restrictions or server issues.' 
          };
        }
        
        if (response.status === 403 || errorText.includes('Forbidden')) {
          return { 
            success: false, 
            error: 'Access denied to this URL. Please ensure the content is publicly accessible.' 
          };
        }
        
        return { 
          success: false, 
          error: `Service error (${response.status}): ${errorText || 'Unknown error'}` 
        };
      }

      const responseText = await response.text();
      console.log('Edge function raw response length:', responseText.length);
      console.log('Edge function raw response preview:', responseText.substring(0, 200));
      
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
        console.log('Parsed result structure:', {
          success: result.success,
          hasData: !!result.data,
          dataLength: result.data?.length || 0,
          error: result.error
        });
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        console.error('Failed to parse response:', responseText);
        
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
      console.log('Data extracted, length:', result.data?.length || 0);
      console.log('=== FireCrawl Debug End ===');
      return { 
        success: true,
        data: result.data 
      };
    } catch (error) {
      console.error('=== FireCrawl Error ===');
      console.error('Error during FireCrawl scraping:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      if (error instanceof Error) {
        if (error.message?.includes('Unexpected token') && error.message?.includes('<')) {
          return { 
            success: false, 
            error: 'Service temporarily unavailable. Please try again later or use the "Paste Text" option.' 
          };
        }
        
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          return { 
            success: false, 
            error: 'Unable to access this URL. Please ensure it is publicly accessible.' 
          };
        }
        
        if (error.message?.includes('fetch')) {
          return { 
            success: false, 
            error: 'Network error: Unable to connect to scraping service. Please check your internet connection.' 
          };
        }
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to scraping service' 
      };
    }
  }

  // Simple URL validation - accept any valid URL
  static validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Accept HTTP and HTTPS protocols
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
