
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormValues } from './schemas/podcastFormSchema';

interface PodcastTitleInputProps {
  form: UseFormReturn<FormValues>;
}

export const PodcastTitleInput: React.FC<PodcastTitleInputProps> = ({ form }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="title">Podcast Title</Label>
      <Input 
        id="title" 
        placeholder="e.g., John Doe's Career Journey" 
        {...form.register('title')} 
      />
      {form.formState.errors.title && (
        <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
      )}
    </div>
  );
};
