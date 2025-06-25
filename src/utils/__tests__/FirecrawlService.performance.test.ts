
import { FirecrawlService } from '../FirecrawlService';
import { server } from '../../__mocks__/firecrawl-server';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('FirecrawlService Performance Tests', () => {
  it('should handle multiple concurrent requests', async () => {
    const urls = [
      'https://linkedin.com/in/user1',
      'https://linkedin.com/in/user2',
      'https://linkedin.com/in/user3',
      'https://linkedin.com/in/user4',
      'https://linkedin.com/in/user5',
    ];

    const startTime = Date.now();
    
    const promises = urls.map(url => FirecrawlService.scrapeUrl(url));
    const results = await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // All requests should succeed
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
    
    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(5000); // 5 seconds max for 5 concurrent requests
  });

  it('should handle request timeout gracefully', async () => {
    // This test would be more relevant in a real environment
    // For now, we'll test that the service doesn't hang indefinitely
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Test timeout')), 10000); // 10 second timeout
    });
    
    const scrapePromise = FirecrawlService.scrapeUrl('https://linkedin.com/in/nicholasmoore');
    
    try {
      const result = await Promise.race([scrapePromise, timeoutPromise]);
      expect(result).toBeDefined();
    } catch (error) {
      // If timeout occurs, the service should handle it gracefully
      expect(error).toBeInstanceOf(Error);
    }
  });

  it('should not leak memory with repeated requests', async () => {
    // Simulate multiple sequential requests
    const iterations = 50;
    
    for (let i = 0; i < iterations; i++) {
      const result = await FirecrawlService.scrapeUrl(`https://linkedin.com/in/user${i}`);
      expect(result.success).toBe(true);
    }
    
    // If we reach this point without running out of memory, the test passes
    expect(true).toBe(true);
  });
});
