
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileText } from 'lucide-react';

interface LinkedInSubmitButtonProps {
  isLoading: boolean;
  isExtracting: boolean;
  disabled?: boolean;
}

export const LinkedInSubmitButton: React.FC<LinkedInSubmitButtonProps> = ({ 
  isLoading, 
  isExtracting,
  disabled = false
}) => {
  return (
    <Button 
      type="submit" 
      disabled={isLoading || disabled}
      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Creating LinkedIn Podcast...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          Create Podcast from LinkedIn
        </>
      )}
    </Button>
  );
};
