
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useLinkedInOAuth = (onProfileData: (data: string) => void) => {
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);

  // Handle OAuth callback and profile extraction
  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('=== LinkedIn OAuth Callback Handler ===');
      console.log('Current URL:', window.location.href);
      console.log('URL params:', window.location.search);
      console.log('URL hash:', window.location.hash);
      
      // Check if we're coming from OAuth (has specific URL params or hash)
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasOAuthParams = urlParams.get('code') || hashParams.get('access_token') || 
                           urlParams.get('state') || hashParams.get('state');
      
      // Small delay to ensure auth state is settled, especially after OAuth redirect
      const delay = hasOAuthParams ? 2000 : 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        console.log('Checking for LinkedIn OAuth session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        console.log('Session check result:');
        console.log('- Session exists:', !!session);
        console.log('- Provider:', session?.user?.app_metadata?.provider);
        console.log('- Provider token exists:', !!session?.provider_token);
        console.log('- Provider token length:', session?.provider_token?.length || 0);
        console.log('- User ID:', session?.user?.id);
        console.log('- User email:', session?.user?.email);

        // More flexible check for LinkedIn session
        const isLinkedInSession = session?.user?.app_metadata?.provider === 'linkedin_oidc' ||
                                session?.user?.app_metadata?.provider === 'linkedin';

        if (session?.provider_token && isLinkedInSession) {
          console.log('=== LinkedIn OAuth Session Found ===');
          console.log('Processing LinkedIn profile...');
          setIsProcessingProfile(true);
          
          // Extract profile data using the provider token
          const profileData = await extractLinkedInProfile(session.provider_token);
          
          if (profileData) {
            console.log('Profile data extracted successfully, length:', profileData.length);
            onProfileData(profileData);
            toast.success('LinkedIn profile imported successfully!');
            
            // Clear OAuth params from URL
            if (hasOAuthParams) {
              window.history.replaceState({}, document.title, '/create');
            }
          } else {
            console.error('Failed to extract LinkedIn profile data');
            toast.error('Failed to extract LinkedIn profile data');
          }
          
          setIsProcessingProfile(false);
        } else {
          console.log('No LinkedIn OAuth session found or invalid session');
          console.log('Session details:', {
            hasSession: !!session,
            provider: session?.user?.app_metadata?.provider,
            hasProviderToken: !!session?.provider_token,
            providerTokenPreview: session?.provider_token?.substring(0, 20) + '...'
          });
        }
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setIsProcessingProfile(false);
        toast.error('Error processing LinkedIn authentication');
      }
    };

    // Run the callback handler
    handleOAuthCallback();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('=== Auth State Change Event ===');
      console.log('Event:', event);
      console.log('Session provider:', session?.user?.app_metadata?.provider);
      console.log('Provider token exists:', !!session?.provider_token);
      
      if (event === 'SIGNED_IN' && 
          (session?.user?.app_metadata?.provider === 'linkedin_oidc' || 
           session?.user?.app_metadata?.provider === 'linkedin')) {
        console.log('LinkedIn sign-in detected, processing profile...');
        // Small delay to ensure everything is ready
        setTimeout(() => {
          handleOAuthCallback();
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, [onProfileData]);

  const extractLinkedInProfile = async (accessToken: string): Promise<string | null> => {
    try {
      console.log('=== LinkedIn Profile Extraction ===');
      console.log('Access token exists:', !!accessToken);
      console.log('Access token length:', accessToken?.length);
      console.log('Access token preview:', accessToken?.substring(0, 30) + '...');
      console.log('Calling linkedin-profile function...');
      
      const { data, error } = await supabase.functions.invoke('linkedin-profile', {
        body: { access_token: accessToken }
      });

      console.log('LinkedIn function response received');
      console.log('Error:', error);
      console.log('Data keys:', data ? Object.keys(data) : 'No data');

      if (error) {
        console.error('LinkedIn profile function error:', error);
        toast.error(`Failed to extract LinkedIn profile: ${error.message}`);
        return null;
      }

      if (data?.success && data?.data) {
        console.log('LinkedIn profile data received successfully');
        console.log('Profile data length:', data.data.length);
        console.log('Profile data preview:', data.data.substring(0, 200) + '...');
        return data.data;
      } else {
        console.error('LinkedIn profile function returned no data:', data);
        toast.error('No profile data received from LinkedIn');
        return null;
      }
    } catch (error) {
      console.error('Error calling LinkedIn profile function:', error);
      toast.error('Error processing LinkedIn profile');
      return null;
    }
  };

  return { isProcessingProfile };
};
