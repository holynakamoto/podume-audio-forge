
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Globe, Lock } from 'lucide-react';

interface PodcastSharingControlsProps {
  podcastId: string;
  isPublic: boolean;
  onSharingChange: (isPublic: boolean) => void;
}

export const PodcastSharingControls: React.FC<PodcastSharingControlsProps> = ({
  podcastId,
  isPublic,
  onSharingChange,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSharingToggle = async (checked: boolean) => {
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('podcasts')
        .update({ is_public: checked })
        .eq('id', podcastId);

      if (error) {
        throw error;
      }

      onSharingChange(checked);
      toast.success(checked ? 'Podcast is now public' : 'Podcast is now private');
    } catch (error: any) {
      console.error('Error updating sharing settings:', error);
      toast.error('Failed to update sharing settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          Sharing Settings
        </CardTitle>
        <CardDescription>
          Control who can access your podcast
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="public-sharing"
            checked={isPublic}
            onCheckedChange={handleSharingToggle}
            disabled={isUpdating}
          />
          <Label htmlFor="public-sharing">
            {isPublic ? 'Public - Anyone can view' : 'Private - Only you can view'}
          </Label>
        </div>
        {isPublic && (
          <p className="text-sm text-muted-foreground mt-2">
            Your podcast is publicly accessible and can be shared with others.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
