
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PodcastSubmitButtonProps {
  isLoading: boolean;
  canSubmit: boolean;
}

export const PodcastSubmitButton: React.FC<PodcastSubmitButtonProps> = ({ 
  isLoading, 
  canSubmit 
}) => {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isLoading || !canSubmit}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Generate Podcast
    </Button>
  );
};
