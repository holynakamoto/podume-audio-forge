
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { sanitizeText, secureStorage } from '@/utils/security';

const contactSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email address.' })
    .max(254, { message: 'Email too long.' }),
  firstName: z.string()
    .min(1, { message: 'First name is required.' })
    .max(50, { message: 'First name too long.' })
    .regex(/^[a-zA-Z\s-']+$/, { message: 'First name contains invalid characters.' }),
  lastName: z.string()
    .min(1, { message: 'Last name is required.' })
    .max(50, { message: 'Last name too long.' })
    .regex(/^[a-zA-Z\s-']+$/, { message: 'Last name contains invalid characters.' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ZooToolsContactFormProps {
  apiKey?: string;
  onSuccess?: (contact: any) => void;
}

const ZooToolsContactForm = ({ apiKey, onSuccess }: ZooToolsContactFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [localApiKey, setLocalApiKey] = useState(() => {
    return apiKey || secureStorage.getItem('zootools_api_key') || '';
  });

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
    },
  });

  const handleApiKeyChange = (value: string) => {
    const sanitizedKey = sanitizeText(value);
    setLocalApiKey(sanitizedKey);
    if (sanitizedKey) {
      secureStorage.setItem('zootools_api_key', sanitizedKey);
    } else {
      secureStorage.removeItem('zootools_api_key');
    }
  };

  const handleSubmit = async (values: ContactFormValues) => {
    if (!localApiKey) {
      toast.error('Please enter your ZooTools API key');
      return;
    }

    setIsLoading(true);
    console.log('Submitting contact to ZooTools:', values);

    try {
      // Sanitize input data
      const sanitizedData = {
        email: sanitizeText(values.email),
        firstName: sanitizeText(values.firstName),
        lastName: sanitizeText(values.lastName),
      };

      const response = await fetch('https://api.zootools.co/v1/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localApiKey}`,
        },
        body: JSON.stringify({
          properties: sanitizedData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('ZooTools response:', data);

      toast.success(
        data.operation === 'contact_created' 
          ? 'Contact created successfully!' 
          : 'Contact updated successfully!'
      );

      form.reset();
      onSuccess?.(data.contact);
    } catch (error) {
      console.error('Error adding contact to ZooTools:', error);
      toast.error('Failed to add contact. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Contact to ZooTools</CardTitle>
        <CardDescription>
          Add a new contact to your ZooTools CRM
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!apiKey && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">ZooTools API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your ZooTools API key"
              value={localApiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              API key is stored securely in session storage
            </p>
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              maxLength={254}
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="John"
              maxLength={50}
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              maxLength={50}
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !localApiKey}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Contact
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ZooToolsContactForm;
