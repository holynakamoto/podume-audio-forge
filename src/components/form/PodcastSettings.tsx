
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormValues } from './schemas/podcastFormSchema';

interface PodcastSettingsProps {
  form: UseFormReturn<FormValues>;
}

export const PodcastSettings: React.FC<PodcastSettingsProps> = ({ form }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="package_type">Package Type</Label>
          <Select 
            onValueChange={(value) => form.setValue('package_type', value as 'core' | 'upsell')} 
            defaultValue="core"
          >
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
          <Switch 
            id="voice_clone" 
            onCheckedChange={(checked) => form.setValue('voice_clone', checked)} 
          />
          <Label htmlFor="voice_clone">Enable Voice Clone</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="premium_assets" 
            onCheckedChange={(checked) => form.setValue('premium_assets', checked)} 
          />
          <Label htmlFor="premium_assets">Include Premium Assets</Label>
        </div>
      </div>
    </>
  );
};
