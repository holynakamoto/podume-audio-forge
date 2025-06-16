
import * as z from 'zod';

export const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  resume_content: z.string().min(5, { message: 'Resume content must be at least 5 characters.' }),
  package_type: z.enum(['core', 'upsell']),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;
