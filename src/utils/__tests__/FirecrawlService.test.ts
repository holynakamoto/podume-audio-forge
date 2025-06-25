
import { FirecrawlService } from '../FirecrawlService';
import { server } from '../../__mocks__/firecrawl-server';
import { rest } from 'msw';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('FirecrawlService', () => {
  describe('validateUrl', () => {
    it('should validate valid HTTP URLs', () => {
      expect(FirecrawlService.validateUrl('http://example.com')).toBe(true);
      expect(FirecrawlService.validateUrl('https://linkedin.com/in/nicholasmoore')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(FirecrawlService.validateUrl('invalid-url')).toBe(false);
      expect(FirecrawlService.validateUrl('ftp://example.com')).toBe(false);
      expect(FirecrawlService.validateUrl('')).toBe(false);
    });
  });

  describe('scrapeUrl', () => {
    it('should successfully scrape LinkedIn profile data', async () => {
      const result = await FirecrawlService.scrapeUrl('https://linkedin.com/in/nicholasmoore');
      
      expect(result.success).toBe(true);
      expect(result.data).toContain('Nick Moore ⚡️');
      expect(result.data).toContain('Anaheim, California, United States');
      expect(result.data).toContain('He Makes All Things New');
    });

    it('should handle API errors gracefully', async () => {
      // Mock API failure
      server.use(
        rest.post('/api/firecrawl-scrape', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ success: false, error: 'Server error' })
          );
        })
      );

      const result = await FirecrawlService.scrapeUrl('https://linkedin.com/in/nicholasmoore');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should handle network errors', async () => {
      // Mock network failure
      server.use(
        rest.post('/api/firecrawl-scrape', (req, res, ctx) => {
          return res.networkError('Network error');
        })
      );

      const result = await FirecrawlService.scrapeUrl('https://linkedin.com/in/nicholasmoore');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to connect to scraping service');
    });

    it('should handle empty response data', async () => {
      // Mock empty response
      server.use(
        rest.post('/api/firecrawl-scrape', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ success: true, data: '' })
          );
        })
      );

      const result = await FirecrawlService.scrapeUrl('https://linkedin.com/in/nicholasmoore');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('');
    });

    it('should send correct request payload', async () => {
      let requestBody: any;
      
      server.use(
        rest.post('/api/firecrawl-scrape', (req, res, ctx) => {
          requestBody = req.body;
          return res(
            ctx.status(200),
            ctx.json({ success: true, data: 'test data' })
          );
        })
      );

      await FirecrawlService.scrapeUrl('https://linkedin.com/in/nicholasmoore');
      
      expect(requestBody).toEqual({
        url: 'https://linkedin.com/in/nicholasmoore'
      });
    });
  });
});
