
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  resume_content: z.string().min(100, { message: 'Resume content must be at least 100 characters.' }),
  package_type: z.enum(['core', 'upsell']),
  voice_clone: z.boolean().default(false),
  premium_assets: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export const PodcastCreationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      package_type: 'core',
      voice_clone: false,
      premium_assets: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    toast.info('Generating your podcast... This may take a moment.');

    const { data, error } = await supabase.functions.invoke('generate-podcast', {
      body: values,
    });

    setIsLoading(false);
    if (error) {
      toast.error(`Failed to create podcast: ${error.message}`);
    } else {
      toast.success('Your podcast has been created!');
      const newPodcastId = data.podcast.id;
      navigate(`/podcast/${newPodcastId}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Podcast</CardTitle>
        <CardDescription>Fill in the details below to generate your audio resume.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Podcast Title</Label>
            <Input id="title" placeholder="e.g., John Doe's Career Journey" {...form.register('title')} />
            {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="resume_content">Paste Your Resume</Label>
            <Textarea id="resume_content" placeholder="Paste your full resume text here..." {...form.register('resume_content')} className="min-h-[200px]" />
            {form.formState.errors.resume_content && <p className="text-red-500 text-sm">{form.formState.errors.resume_content.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="package_type">Package Type</Label>
              <Select onValueChange={(value) => form.setValue('package_type', value as 'core' | 'upsell')} defaultValue="core">
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="upsell">Upsell (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch id="voice_clone" onCheckedChange={(checked) => form.setValue('voice_clone', checked)} />
                <Label htmlFor="voice_clone">Enable Voice Clone</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="premium_assets" onCheckedChange={(checked) => form.setValue('premium_assets', checked)} />
                <Label htmlFor="premium_assets">Include Premium Assets</Label>
              </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Podcast
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
