
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define TypeScript interfaces for type safety
interface LinkedInProfileResponse {
  success: boolean;
  data: string | null;
  raw_profile?: unknown;
}

interface SupabaseSession {
  provider_token?: string;
  user?: {
    id: string;
    email?: string;
    app_metadata: {
      provider?: string;
    };
  };
}

export const useLinkedInOAuth = (
  onProfileData: (data: string) => void,
  onRawJSON?: (json: string) => void
) => {
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);

  // Conditional logging for development only
  const log = process.env.NODE_ENV === 'development' ? console.log : () => {};

  useEffect(() => {
    const extractLinkedInProfile = async (): Promise<{
      profileData: string | null;
      rawJSON: string | null;
    }> => {
      try {
        log('[LinkedInOAuth] Extracting LinkedIn profile via session...');
        
        // Get current session to check for LinkedIn provider token
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!sessionData.session) {
          throw new Error('No active session found. Please sign in with LinkedIn.');
        }

        const session = sessionData.session as SupabaseSession;
        log('[LinkedInOAuth] Session provider:', session.user?.app_metadata?.provider);
        log('[LinkedInOAuth] Has provider token:', !!session.provider_token);

        if (session.user?.app_metadata?.provider !== 'linkedin_oidc') {
          throw new Error('Current session is not from LinkedIn OIDC. Please sign in with LinkedIn.');
        }

        if (!session.provider_token) {
          throw new Error('No LinkedIn access token found in session.');
        }

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            log('[LinkedInOAuth] Calling linkedin-profile edge function, attempt:', attempt);
            
            // Call the edge function without passing the token in body - it will get it from session
            const { data, error } = await supabase.functions.invoke<LinkedInProfileResponse>('linkedin-profile', {
              headers: {
                'Authorization': `Bearer ${sessionData.session.access_token}`
              }
            });

            log('[LinkedInOAuth] LinkedIn function response received');
            log('[LinkedInOAuth] Error:', error);
            log('[LinkedInOAuth] Data:', data);

            if (error) {
              console.warn(`[LinkedInOAuth] Attempt ${attempt} failed: ${error.message}`);
              if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
              }
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              continue;
            }

            if (data?.success && data?.data) {
              log('[LinkedInOAuth] LinkedIn profile data received successfully');
              
              const rawJSON = data?.raw_profile ? JSON.stringify(data.raw_profile) : null;
              log('[LinkedInOAuth] Raw JSON available:', !!rawJSON);

              return { 
                profileData: data.data,
                rawJSON
              };
            } else {
              console.error('[LinkedInOAuth] LinkedIn profile function returned no data:', data);
              toast.error('No profile data received from LinkedIn');
              return { profileData: null, rawJSON: null };
            }
          } catch (error: any) {
            console.error('[LinkedInOAuth] Retry failed:', error);
            if (attempt === maxRetries) {
              toast.error(`Failed to extract LinkedIn profile after ${maxRetries} attempts: ${error.message || 'Unknown error'}`);
              return { profileData: null, rawJSON: null };
            }
          }
        }
        return { profileData: null, rawJSON: null };
      } catch (error: any) {
        console.error('[LinkedInOAuth] Error calling LinkedIn profile function:', error);
        toast.error(`Error processing LinkedIn profile: ${error.message || 'Unknown error'}`);
        return { profileData: null, rawJSON: null };
      }
    };

    const handleLinkedInSession = async () => {
      try {
        log('[LinkedInOAuth] Checking for LinkedIn OAuth session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[LinkedInOAuth] Session error:', sessionError);
          return;
        }

        log('[LinkedInOAuth] Session check result:');
        log('[LinkedInOAuth] - Session exists:', !!session);
        log('[LinkedInOAuth] - Provider:', session?.user?.app_metadata?.provider);
        log('[LinkedInOAuth] - Provider token exists:', !!session?.provider_token);

        const isLinkedInSession = session?.user?.app_metadata?.provider === 'linkedin_oidc';
        log('[LinkedInOAuth] Is LinkedIn session:', isLinkedInSession);

        if (isLinkedInSession && session?.provider_token) {
          log('[LinkedInOAuth] Processing LinkedIn profile...');
          setIsProcessingProfile(true);
          
          const { profileData, rawJSON } = await extractLinkedInProfile();
          
          if (profileData) {
            onProfileData(profileData);
            toast.success('LinkedIn profile imported successfully!');
          }
          
          if (rawJSON && onRawJSON) {
            onRawJSON(rawJSON);
          }
          
          setIsProcessingProfile(false);
        } else {
          log('[LinkedInOAuth] No LinkedIn OAuth session found');
        }
      } catch (error: any) {
        console.error('[LinkedInOAuth] Error processing LinkedIn session:', error);
        setIsProcessingProfile(false);
        toast.error(`Error processing LinkedIn profile: ${error.message || 'Unknown error'}`);
      }
    };

    // Check for LinkedIn session on component mount
    handleLinkedInSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      log('[LinkedInOAuth] === Auth State Change Event ===');
      log('[LinkedInOAuth] Event:', event);
      log('[LinkedInOAuth] Session provider:', session?.user?.app_metadata?.provider);

      if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'linkedin_oidc') {
        log('[LinkedInOAuth] LinkedIn sign-in detected, processing profile...');
        
        // Small delay to ensure session is fully established
        setTimeout(() => {
          handleLinkedInSession();
        }, 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onProfileData, onRawJSON]);

  return { isProcessingProfile };
};
