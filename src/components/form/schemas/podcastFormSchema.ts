
import * as z from 'zod';
import { validateInput } from '@/utils/secureValidation';

export const formSchema = z.object({
  title: z.string()
    .min(3, { message: 'Title must be at least 3 characters.' })
    .max(200, { message: 'Title must be less than 200 characters.' })
    .refine((val) => {
      const result = validateInput.text(val, 200);
      return result.isValid;
    }, 'Title contains invalid characters'),
  
  resume_content: z.string()
    .min(5, { message: 'Resume content must be at least 5 characters.' })
    .max(50000, { message: 'Resume content is too long.' })
    .refine((val) => {
      const result = validateInput.text(val, 50000);
      return result.isValid;
    }, 'Resume content contains invalid characters'),
  
  package_type: z.enum(['core', 'upsell']),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;
