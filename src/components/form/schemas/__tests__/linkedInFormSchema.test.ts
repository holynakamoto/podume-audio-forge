
import { linkedInFormSchema } from '../linkedInFormSchema';

describe('linkedInFormSchema', () => {
  describe('linkedin_url validation', () => {
    const validUrls = [
      'https://linkedin.com/in/nicholasmoore',
      'https://www.linkedin.com/in/nicholasmoore',
      'http://linkedin.com/in/nicholasmoore',
      'http://www.linkedin.com/in/nicholasmoore',
      'https://linkedin.com/in/john-smith',
      'https://linkedin.com/in/jane_doe',
      'https://linkedin.com/in/user123',
      'https://linkedin.com/in/nicholasmoore/',
      'https://linkedin.com/in/nicholasmoore?trk=public',
    ];

    const invalidUrls = [
      'linkedin.com/in/nicholasmoore', // missing protocol
      'https://facebook.com/nicholasmoore',
      'https://linkedin.com/company/example',
      'https://linkedin.com/in/',
      'invalid-url',
      '',
    ];

    test.each(validUrls)('should accept valid LinkedIn URL: %s', (url) => {
      const result = linkedInFormSchema.safeParse({
        title: 'My Podumé',
        linkedin_url: url,
        package_type: 'core',
        voice_clone: false,
        premium_assets: false,
      });
      
      expect(result.success).toBe(true);
    });

    test.each(invalidUrls)('should reject invalid LinkedIn URL: %s', (url) => {
      const result = linkedInFormSchema.safeParse({
        title: 'My Podumé',
        linkedin_url: url,
        package_type: 'core',
        voice_clone: false,
        premium_assets: false,
      });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('linkedin_url')
        )).toBe(true);
      }
    });

    // Specific test for the problematic URL
    test('should specifically accept https://linkedin.com/in/nicholasmoore', () => {
      const testUrl = 'https://linkedin.com/in/nicholasmoore';
      const result = linkedInFormSchema.safeParse({
        title: 'My Podumé',
        linkedin_url: testUrl,
        package_type: 'core',
        voice_clone: false,
        premium_assets: false,
      });
      
      console.log('Specific test result for', testUrl, ':', result);
      expect(result.success).toBe(true);
    });
  });
});
