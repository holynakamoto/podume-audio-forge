
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
    user_metadata?: any;
  };
}

export const useLinkedInOAuth = (
  onProfileData: (data: string) => void,
  onRawJSON?: (json: string) => void
) => {
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  // Conditional logging for development only
  const log = process.env.NODE_ENV === 'development' ? console.log : () => {};

  useEffect(() => {
    console.log('[LinkedInOAuth] Hook mounted and useEffect starting...');
    
    try {
      console.log('[LinkedInOAuth] Current URL on mount:', window.location.href);
      console.log('[LinkedInOAuth] URL search params:', window.location.search);
      console.log('[LinkedInOAuth] URL hash:', window.location.hash);
    } catch (error) {
      console.error('[LinkedInOAuth] Error accessing window location:', error);
    }
    
    const extractLinkedInProfile = async (): Promise<{
      profileData: string | null;
      rawJSON: string | null;
    }> => {
      try {
        console.log('[LinkedInOAuth] Starting LinkedIn profile extraction...');
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
        
        // Check if we have LinkedIn user metadata directly in the session
        const userMetadata = session.user?.user_metadata;
        if (userMetadata && userMetadata.iss === 'https://www.linkedin.com/oauth') {
          console.log('[LinkedInOAuth] Found LinkedIn user metadata in session, using directly');
          
          // Create formatted profile data from user metadata
          const linkedInData = {
            id: userMetadata.sub || userMetadata.provider_id,
            name: userMetadata.name || userMetadata.full_name,
            given_name: userMetadata.given_name,
            family_name: userMetadata.family_name,
            email: userMetadata.email,
            email_verified: userMetadata.email_verified,
            picture: userMetadata.picture || userMetadata.avatar_url,
            locale: userMetadata.locale,
            provider: 'linkedin_oidc'
          };
          
          // Format as resume content
          const resumeContent = formatLinkedInUserMetadata(linkedInData);
          const rawJSON = JSON.stringify(linkedInData, null, 2);
          
          return { profileData: resumeContent, rawJSON };
        }
        
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

    // Helper function to format LinkedIn user metadata
    const formatLinkedInUserMetadata = (profile: any): string => {
      const fullName = profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'LinkedIn Professional';
      
      let content = `# ${fullName}\n\n`;
      
      if (profile.email && profile.email_verified) {
        content += `**Email:** ${profile.email}\n\n`;
      }
      
      if (profile.id) {
        content += `**LinkedIn ID:** ${profile.id}\n\n`;
      }
      
      content += `## Professional Summary\n`;
      content += `${fullName} is an accomplished professional with a verified LinkedIn presence. `;
      content += `They maintain an active professional network and demonstrate commitment to career excellence and growth.\n\n`;
      
      content += `## Profile Information\n`;
      if (profile.given_name && profile.family_name) {
        content += `• **Name:** ${profile.given_name} ${profile.family_name}\n`;
      }
      if (profile.locale) {
        content += `• **Location/Locale:** ${profile.locale}\n`;
      }
      if (profile.email_verified) {
        content += `• **Verified Email:** Yes\n`;
      }
      content += `• **Platform:** LinkedIn (OIDC Verified)\n\n`;
      
      content += `## Core Competencies\n`;
      content += `• Professional networking and relationship building\n`;
      content += `• Industry expertise and thought leadership\n`;
      content += `• Strategic communication and collaboration\n`;
      content += `• Digital presence and personal branding\n`;
      content += `• Continuous professional development\n\n`;
      
      return content;
    };

    const handleLinkedInSession = async () => {
      if (hasProcessed) {
        log('[LinkedInOAuth] Already processed, skipping...');
        return;
      }

      try {
        log('[LinkedInOAuth] Checking for LinkedIn OAuth session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('[LinkedInOAuth] Session check - URL:', window.location.href);
        console.log('[LinkedInOAuth] Session check - error:', sessionError);
        console.log('[LinkedInOAuth] Session check - session exists:', !!session);

        if (sessionError) {
          console.error('[LinkedInOAuth] Session error:', sessionError);
          toast.error(`Session error: ${sessionError.message}`);
          return;
        }

        log('[LinkedInOAuth] Session check result:');
        log('[LinkedInOAuth] - Session exists:', !!session);
        log('[LinkedInOAuth] - Provider:', session?.user?.app_metadata?.provider);
        log('[LinkedInOAuth] - Provider token exists:', !!session?.provider_token);

        const isLinkedInSession = session?.user?.app_metadata?.provider === 'linkedin_oidc' || 
          (session?.provider_token && session?.user?.user_metadata?.iss === 'https://www.linkedin.com/oauth');
        log('[LinkedInOAuth] Is LinkedIn session:', isLinkedInSession);
        log('[LinkedInOAuth] Has LinkedIn user metadata:', !!session?.user?.user_metadata?.iss);

        if (isLinkedInSession && session?.provider_token && !hasProcessed) {
          log('[LinkedInOAuth] Processing LinkedIn profile...');
          setIsProcessingProfile(true);
          setHasProcessed(true);
          
          const { profileData, rawJSON } = await extractLinkedInProfile();
          
          console.log('=== LinkedIn Profile Extracted ===');
          console.log('Profile data exists:', !!profileData);
          console.log('Profile data length:', profileData?.length || 0);
          
          if (profileData) {
            console.log('Calling onProfileData with profile data');
            onProfileData(profileData);
            toast.success('LinkedIn profile imported successfully!');
          } else {
            console.log('No profile data received');
            toast.error('No profile data received from LinkedIn');
          }
          
          if (rawJSON && onRawJSON) {
            onRawJSON(rawJSON);
          }
          
          setIsProcessingProfile(false);
        } else {
          log('[LinkedInOAuth] No LinkedIn OAuth session found or already processed');
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
      console.log('[LinkedInOAuth] === Auth State Change Event ===');
      console.log('[LinkedInOAuth] Event:', event);
      console.log('[LinkedInOAuth] Session provider:', session?.user?.app_metadata?.provider);
      console.log('[LinkedInOAuth] Current URL during auth change:', window.location.href);

      if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'linkedin_oidc') {
        console.log('[LinkedInOAuth] LinkedIn sign-in detected, processing profile...');
        
        // Small delay to ensure session is fully established
        setTimeout(() => {
          handleLinkedInSession();
        }, 1000);
      }
      
      // Handle any auth errors
      if (event === 'SIGNED_OUT') {
        console.log('[LinkedInOAuth] User signed out');
        setIsProcessingProfile(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [onProfileData, onRawJSON]);

  return { isProcessingProfile };
};
