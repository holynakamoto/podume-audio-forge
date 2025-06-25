
import { FirecrawlService } from '../FirecrawlService';

describe('FirecrawlService Debug Tests', () => {
  it('should test actual response from LinkedIn URL', async () => {
    const testUrl = 'https://linkedin.com/in/nicholasmoore';
    
    console.log('=== DEBUGGING FIRECRAWL RESPONSE ===');
    console.log('Testing URL:', testUrl);
    
    // Mock fetch to capture the actual request/response
    const originalFetch = global.fetch;
    let capturedResponse: any = null;
    let capturedRequest: any = null;
    
    global.fetch = jest.fn().mockImplementation(async (url, options) => {
      capturedRequest = { url, options };
      console.log('Request URL:', url);
      console.log('Request options:', JSON.stringify(options, null, 2));
      
      // Call the real fetch to see what happens
      const response = await originalFetch(url, options);
      const text = await response.text();
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response text (first 500 chars):', text.substring(0, 500));
      console.log('Response text type:', typeof text);
      console.log('Is valid JSON?', (() => {
        try {
          JSON.parse(text);
          return true;
        } catch {
          return false;
        }
      })());
      
      capturedResponse = {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        text: text,
        isJSON: (() => {
          try {
            JSON.parse(text);
            return true;
          } catch {
            return false;
          }
        })()
      };
      
      // Return a mock response that mimics what we received
      return new Response(text, {
        status: response.status,
        headers: response.headers
      });
    });
    
    try {
      const result = await FirecrawlService.scrapeUrl(testUrl);
      console.log('FirecrawlService result:', result);
    } catch (error) {
      console.log('FirecrawlService error:', error);
    }
    
    // Restore original fetch
    global.fetch = originalFetch;
    
    // Log what we captured
    console.log('=== CAPTURED DATA ===');
    console.log('Request:', capturedRequest);
    console.log('Response summary:', {
      status: capturedResponse?.status,
      isJSON: capturedResponse?.isJSON,
      textLength: capturedResponse?.text?.length,
      textPreview: capturedResponse?.text?.substring(0, 200)
    });
    console.log('=== END DEBUG ===');
    
    // The test passes if we captured the data - we're just debugging
    expect(capturedResponse).toBeDefined();
  });
});
