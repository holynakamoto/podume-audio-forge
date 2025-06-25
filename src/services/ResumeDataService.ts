
export interface ResumeData {
  success: boolean;
  data?: string;
  error?: string;
  source: 'firecrawl' | 'kickresume_api' | 'teal_api' | 'manual';
  metadata?: {
    extractionMethod: string;
    timestamp: string;
    confidence?: number;
    platform?: 'kickresume' | 'teal' | 'other';
  };
}

export interface ResumeUrlInfo {
  isValid: boolean;
  platform?: 'kickresume' | 'teal' | 'other';
  resumeId?: string;
  isPreviewUrl: boolean;
  originalUrl: string;
}

export class ResumeDataService {
  // Parse supported resume URLs to extract info and validate format
  static parseResumeUrl(url: string): ResumeUrlInfo {
    // Try Kickresume first
    const kickresumeInfo = this.parseKickresume(url);
    if (kickresumeInfo.isValid) {
      return { ...kickresumeInfo, platform: 'kickresume' };
    }

    // Try Teal
    const tealInfo = this.parseTeal(url);
    if (tealInfo.isValid) {
      return { ...tealInfo, platform: 'teal' };
    }

    // Accept any other valid URL as 'other' platform
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return {
          isValid: true,
          platform: 'other',
          isPreviewUrl: false,
          originalUrl: url
        };
      }
    } catch {
      // Invalid URL
    }

    return {
      isValid: false,
      isPreviewUrl: false,
      originalUrl: url
    };
  }

  // Parse Kickresume URL to extract resume ID and validate format
  private static parseKickresume(url: string): Omit<ResumeUrlInfo, 'platform'> {
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

  // Parse Teal URL to extract resume ID and validate format
  private static parseTeal(url: string): Omit<ResumeUrlInfo, 'platform'> {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a Teal domain
      if (!urlObj.hostname.includes('tealhq.com')) {
        return {
          isValid: false,
          isPreviewUrl: false,
          originalUrl: url
        };
      }

      // Extract resume ID from Teal URL patterns
      const pathname = urlObj.pathname;
      
      // Pattern: /{uuid}
      const uuidMatch = pathname.match(/^\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/);
      if (uuidMatch) {
        return {
          isValid: true,
          resumeId: uuidMatch[1],
          isPreviewUrl: false, // Teal URLs are typically public
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

  // Primary method: Try FireCrawl first, then fallback to platform APIs if available
  static async extractResumeData(url: string): Promise<ResumeData> {
    console.log('=== Resume Data Service: Starting extraction ===');
    console.log('URL:', url);

    const urlInfo = this.parseResumeUrl(url);
    console.log('URL Info:', urlInfo);

    if (!urlInfo.isValid) {
      return {
        success: false,
        error: 'Invalid URL format. Please provide a valid URL.',
        source: 'manual'
      };
    }

    // Method 1: Try FireCrawl (works for any URL)
    try {
      console.log(`Attempting FireCrawl extraction for ${urlInfo.platform || 'website'}...`);
      const firecrawlResult = await this.extractViaFireCrawl(url);
      
      if (firecrawlResult.success) {
        console.log('FireCrawl extraction successful');
        return {
          ...firecrawlResult,
          source: 'firecrawl',
          metadata: {
            extractionMethod: 'FireCrawl Web Scraping',
            timestamp: new Date().toISOString(),
            confidence: 0.8,
            platform: urlInfo.platform
          }
        };
      }
      
      console.log('FireCrawl failed, trying platform API fallback...');
    } catch (error) {
      console.error('FireCrawl extraction error:', error);
    }

    // Method 2: Try platform-specific APIs (only for known platforms with IDs)
    if (urlInfo.resumeId && (urlInfo.platform === 'kickresume' || urlInfo.platform === 'teal')) {
      try {
        console.log(`Attempting ${urlInfo.platform} API extraction...`);
        const apiResult = await this.extractViaPlatformAPI(urlInfo.platform, urlInfo.resumeId);
        
        if (apiResult.success) {
          console.log(`${urlInfo.platform} API extraction successful`);
          return {
            ...apiResult,
            source: urlInfo.platform === 'kickresume' ? 'kickresume_api' : 'teal_api',
            metadata: {
              extractionMethod: `${urlInfo.platform} Direct API`,
              timestamp: new Date().toISOString(),
              confidence: 0.95,
              platform: urlInfo.platform
            }
          };
        }
      } catch (error) {
        console.error(`${urlInfo.platform} API extraction error:`, error);
      }
    }

    // All methods failed
    return {
      success: false,
      error: `Unable to extract content from this URL. Please ensure the content is publicly accessible or try the "Paste Text" option.`,
      source: 'manual'
    };
  }

  // Current working FireCrawl method
  private static async extractViaFireCrawl(url: string): Promise<Omit<ResumeData, 'source'>> {
    const { FirecrawlService } = await import('@/utils/FirecrawlService');
    return await FirecrawlService.scrapeUrl(url);
  }

  // Placeholder for future platform API integration
  private static async extractViaPlatformAPI(platform: 'kickresume' | 'teal', resumeId: string): Promise<Omit<ResumeData, 'source'>> {
    console.log(`${platform} API extraction - placeholder implementation`);
    
    if (platform === 'kickresume') {
      return this.extractViaKickresumAPI(resumeId);
    } else if (platform === 'teal') {
      return this.extractViaTealAPI(resumeId);
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  // Placeholder for Kickresume API integration
  private static async extractViaKickresumAPI(resumeId: string): Promise<Omit<ResumeData, 'source'>> {
    // TODO: Implement when Kickresume API is available
    throw new Error('Kickresume API integration not yet implemented');
  }

  // Placeholder for Teal API integration
  private static async extractViaTealAPI(resumeId: string): Promise<Omit<ResumeData, 'source'>> {
    // TODO: Implement when Teal API is available
    throw new Error('Teal API integration not yet implemented');
  }

  // Validate if URL is accessible for scraping
  static async validateUrl(url: string): Promise<{ isValid: boolean; message: string }> {
    const urlInfo = this.parseResumeUrl(url);
    
    if (!urlInfo.isValid) {
      return {
        isValid: false,
        message: 'Please enter a valid URL'
      };
    }

    if (urlInfo.platform === 'kickresume' && urlInfo.isPreviewUrl) {
      return {
        isValid: true,
        message: 'Kickresume preview URL detected - should work well with extraction'
      };
    }

    if (urlInfo.platform === 'teal') {
      return {
        isValid: true,
        message: 'Teal resume URL detected - extraction will be attempted'
      };
    }

    return {
      isValid: true,
      message: `URL appears valid - extraction will be attempted`
    };
  }
}
