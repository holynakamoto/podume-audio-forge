
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LinkedinIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LinkedInOAuthButtonProps {
  onProfileData: (data: string) => void;
}

export const LinkedInOAuthButton: React.FC<LinkedInOAuthButtonProps> = ({ onProfileData }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkedInAuth = async () => {
    setIsLoading(true);
    try {
      // Use Supabase OAuth for LinkedIn
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          scopes: 'r_liteprofile r_emailaddress',
          redirectTo: `${window.location.origin}/create`
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        toast.error('Failed to connect to LinkedIn');
        return;
      }

      // The OAuth flow will redirect, so we handle the callback in useEffect
      toast.info('Redirecting to LinkedIn...');
      
    } catch (error) {
      console.error('Error initiating LinkedIn OAuth:', error);
      toast.error('Failed to connect to LinkedIn');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleLinkedInAuth}
      disabled={isLoading}
      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting to LinkedIn...
        </>
      ) : (
        <>
          <LinkedinIcon className="w-4 h-4 mr-2 fill-current" />
          Import from LinkedIn
        </>
      )}
    </Button>
  );
};
