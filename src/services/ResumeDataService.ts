
export interface ResumeData {
  success: boolean;
  data?: string;
  error?: string;
  source: 'firecrawl' | 'kickresume_api' | 'manual';
  metadata?: {
    extractionMethod: string;
    timestamp: string;
    confidence?: number;
  };
}

export interface KickresumUrlInfo {
  isValid: boolean;
  resumeId?: string;
  isPreviewUrl: boolean;
  originalUrl: string;
}

export class ResumeDataService {
  // Parse Kickresume URL to extract resume ID and validate format
  static parseKickresume(url: string): KickresumUrlInfo {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a Kickresume domain
      if (!urlObj.hostname.includes('kickresume.com')) {
        return {
          isValid: false,
          isPreviewUrl: false,
          originalUrl: url
        };
      }

      // Extract resume ID from different URL patterns
      let resumeId: string | undefined;
      
      // Pattern: /edit/{id}/preview/
      const editPreviewMatch = url.match(/\/edit\/(\d+)\/preview\/?/);
      if (editPreviewMatch) {
        resumeId = editPreviewMatch[1];
        return {
          isValid: true,
          resumeId,
          isPreviewUrl: true,
          originalUrl: url
        };
      }

      // Pattern: /cv/{id} or /resume/{id}
      const publicMatch = url.match(/\/(cv|resume)\/(\d+)/);
      if (publicMatch) {
        resumeId = publicMatch[2];
        return {
          isValid: true,
          resumeId,
          isPreviewUrl: false,
          originalUrl: url
        };
      }

      return {
        isValid: true,
        isPreviewUrl: false,
        originalUrl: url
      };
    } catch {
      return {
        isValid: false,
        isPreviewUrl: false,
        originalUrl: url
      };
    }
  }

  // Primary method: Try FireCrawl first, then fallback to API if available
  static async extractResumeData(url: string): Promise<ResumeData> {
    console.log('=== Resume Data Service: Starting extraction ===');
    console.log('URL:', url);

    const urlInfo = this.parseKickresume(url);
    console.log('URL Info:', urlInfo);

    if (!urlInfo.isValid) {
      return {
        success: false,
        error: 'Invalid Kickresume URL format',
        source: 'manual'
      };
    }

    // Method 1: Try FireCrawl (current working method)
    try {
      console.log('Attempting FireCrawl extraction...');
      const firecrawlResult = await this.extractViaFireCrawl(url);
      
      if (firecrawlResult.success) {
        console.log('FireCrawl extraction successful');
        return {
          ...firecrawlResult,
          source: 'firecrawl',
          metadata: {
            extractionMethod: 'FireCrawl Web Scraping',
            timestamp: new Date().toISOString(),
            confidence: 0.8
          }
        };
      }
      
      console.log('FireCrawl failed, trying API fallback...');
    } catch (error) {
      console.error('FireCrawl extraction error:', error);
    }

    // Method 2: Try Kickresume API (placeholder for future implementation)
    if (urlInfo.resumeId) {
      try {
        console.log('Attempting Kickresume API extraction...');
        const apiResult = await this.extractViaKickresumAPI(urlInfo.resumeId);
        
        if (apiResult.success) {
          console.log('Kickresume API extraction successful');
          return {
            ...apiResult,
            source: 'kickresume_api',
            metadata: {
              extractionMethod: 'Kickresume Direct API',
              timestamp: new Date().toISOString(),
              confidence: 0.95
            }
          };
        }
      } catch (error) {
        console.error('Kickresume API extraction error:', error);
      }
    }

    // All methods failed
    return {
      success: false,
      error: 'Unable to extract resume data. Please ensure your Kickresume is publicly accessible or try the "Paste Text" option.',
      source: 'manual'
    };
  }

  // Current working FireCrawl method
  private static async extractViaFireCrawl(url: string): Promise<Omit<ResumeData, 'source'>> {
    const { FirecrawlService } = await import('@/utils/FirecrawlService');
    return await FirecrawlService.scrapeUrl(url);
  }

  // Placeholder for future Kickresume API integration
  private static async extractViaKickresumAPI(resumeId: string): Promise<Omit<ResumeData, 'source'>> {
    console.log('Kickresume API extraction - placeholder implementation');
    
    // TODO: Implement when Kickresume API is available
    // This is where we would make direct API calls to Kickresume
    
    // Check if API is configured
    const apiKey = this.getKickresumAPIKey();
    if (!apiKey) {
      throw new Error('Kickresume API not configured');
    }

    // Placeholder API call structure
    try {
      // const response = await fetch(`https://api.kickresume.com/v1/resumes/${resumeId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${apiKey}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // 
      // if (!response.ok) {
      //   throw new Error(`API Error: ${response.status}`);
      // }
      // 
      // const data = await response.json();
      // return {
      //   success: true,
      //   data: this.formatKickresume(data)
      // };

      // For now, return not implemented
      throw new Error('Kickresume API integration not yet implemented');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Kickresume API error'
      };
    }
  }

  // Get Kickresume API key (placeholder)
  private static getKickresumAPIKey(): string | null {
    // TODO: Integrate with Lovable's secret management
    // This would retrieve the API key from environment variables or secret store
    return null; // Not implemented yet
  }

  // Format Kickresume API response to consistent text format
  private static formatKickresume(apiData: any): string {
    // TODO: Implement when we know the API response structure
    // This would convert structured API data to readable text format
    return JSON.stringify(apiData, null, 2);
  }

  // Validate if URL is accessible for scraping
  static async validateUrl(url: string): Promise<{ isValid: boolean; message: string }> {
    const urlInfo = this.parseKickresume(url);
    
    if (!urlInfo.isValid) {
      return {
        isValid: false,
        message: 'Please enter a valid Kickresume URL'
      };
    }

    if (urlInfo.isPreviewUrl) {
      return {
        isValid: true,
        message: 'Preview URL detected - should work well with extraction'
      };
    }

    return {
      isValid: true,
      message: 'URL appears valid - extraction will be attempted'
    };
  }
}
