
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
      console.log('=== LinkedIn OAuth Debug ===');
      console.log('Starting LinkedIn OAuth...');
      console.log('Current URL:', window.location.href);
      
      // Create explicit redirect URL to create page
      const redirectUrl = `${window.location.origin}/create`;
      console.log('Redirect URL set to:', redirectUrl);
      
      // Check if user is already signed in with email
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user?.app_metadata?.provider !== 'linkedin_oidc') {
        console.log('User signed in with different provider, signing out first...');
        await supabase.auth.signOut();
        // Wait a bit for signout to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Use Supabase OAuth for LinkedIn with explicit redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: redirectUrl,
          scopes: 'openid profile email',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('LinkedIn OAuth error:', error);
        toast.error(`Failed to connect to LinkedIn: ${error.message}`);
        return;
      }

      console.log('OAuth initiated successfully, should redirect to:', redirectUrl);
      toast.info('Redirecting to LinkedIn...');
      
    } catch (error: any) {
      console.error('Error initiating LinkedIn OAuth:', error);
      toast.error(`Failed to connect to LinkedIn: ${error.message || 'Unknown error'}`);
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
