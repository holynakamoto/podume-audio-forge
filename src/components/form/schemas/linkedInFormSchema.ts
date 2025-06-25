
import { z } from 'zod';

export const linkedInFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  linkedin_url: z.string().url('Please enter a valid URL').refine(
    (url) => {
      console.log('=== Kickresume URL Validation Debug ===');
      console.log('Input URL:', url);
      console.log('URL type:', typeof url);
      console.log('URL length:', url.length);
      
      // Test multiple patterns to see which one works
      const patterns = [
        { name: 'Kickresume pattern', regex: /^https?:\/\/(www\.)?kickresume\.com\/edit\/\d+\/preview\/?(\?.*)?$/i },
        { name: 'Simple pattern', regex: /kickresume\.com\/edit\//i },
        { name: 'Loose match', regex: /^https?:\/\/(www\.)?kickresume\.com\/.+$/i }
      ];
      
      patterns.forEach(pattern => {
        const result = pattern.regex.test(url);
        console.log(`${pattern.name}:`, result);
        if (result) {
          console.log(`✅ Pattern "${pattern.name}" MATCHED!`);
        } else {
          console.log(`❌ Pattern "${pattern.name}" failed`);
        }
      });
      
      // Character by character analysis
      console.log('Character codes:', Array.from(url).map(char => ({ char, code: char.charCodeAt(0) })));
      
      // Test the current pattern
      const currentPattern = /^https?:\/\/(www\.)?kickresume\.com\/edit\/\d+\/preview\/?(\?.*)?$/i;
      const result = currentPattern.test(url);
      
      console.log('Final result:', result);
      console.log('=== End Debug ===');
      
      return result;
    },
    'Please enter a valid Kickresume preview URL (e.g., https://www.kickresume.com/edit/16086325/preview/)'
  ),
  package_type: z.enum(['core', 'premium']).default('core'),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

export type LinkedInFormValues = z.infer<typeof linkedInFormSchema>;
