
import { z } from 'zod';

export const linkedInFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  linkedin_url: z.string().url('Please enter a valid URL').refine(
    (url) => {
      // Updated pattern to be more flexible and handle various LinkedIn URL formats
      const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_]+\/?(\?.*)?$/i;
      console.log('Testing URL:', url);
      console.log('Pattern test result:', pattern.test(url));
      const result = pattern.test(url);
      return result;
    },
    'Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourprofile)'
  ),
  package_type: z.enum(['core', 'premium']).default('core'),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

export type LinkedInFormValues = z.infer<typeof linkedInFormSchema>;
