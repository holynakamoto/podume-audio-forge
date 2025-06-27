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
    // Move extractLinkedInProfile inside useEffect to clarify dependency
    const extractLinkedInProfile = async (accessToken: string): Promise<{
      profileData: string | null;
      rawJSON: string | null;
    }> => {
      try {
        log('[LinkedInOAuth] Extracting LinkedIn profile...');
        log('[LinkedInOAuth] Access token exists:', !!accessToken);
        log('[LinkedInOAuth] Access token length:', accessToken?.length);
        log('[LinkedInOAuth] Access token preview:', accessToken?.substring(0, 5) + '...[truncated]');

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            log('[LinkedInOAuth] Calling linkedin-profile edge function, attempt:', attempt);
            const { data, error } = await supabase.functions.invoke<LinkedInProfileResponse>('linkedin-profile', {
              body: { access_token: accessToken }
            });

            log('[LinkedInOAuth] LinkedIn function response received');
            log('[LinkedInOAuth] Error:', error);
            log('[LinkedInOAuth] Data:', data);
            log('[LinkedInOAuth] Data keys:', data ? Object.keys(data) : 'No data');

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
              log('[LinkedInOAuth] Profile data length:', data.data.length);
              log('[LinkedInOAuth] Profile data preview:', data.data.substring(0, 200) + '...');

              const rawJSON = data?.raw_profile ? JSON.stringify(data.raw_profile) : null;
              log('[LinkedInOAuth] Raw JSON available:', !!rawJSON);
              log('[LinkedInOAuth] Raw JSON length:', rawJSON?.length || 0);

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

    const handleOAuthCallback = async () => {
      log('[LinkedInOAuth] === LinkedIn OAuth Callback Handler ===');
      log('[LinkedInOAuth] Current URL:', window.location.href);
      log('[LinkedInOAuth] URL params:', window.location.search);
      log('[LinkedInOAuth] URL hash:', window.location.hash);

      // Check for OAuth params in query or hash
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hasOAuthParams = urlParams.get('code') || hashParams.get('access_token') || 
                           urlParams.get('state') || hashParams.get('state');

      log('[LinkedInOAuth] Has OAuth params:', hasOAuthParams);

      try {
        log('[LinkedInOAuth] Checking for LinkedIn OAuth session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[LinkedInOAuth] Session error:', sessionError);
          toast.error(`Error retrieving session: ${sessionError.message || 'Unknown error'}`);
          return;
        }

        log('[LinkedInOAuth] Session check result:');
        log('[LinkedInOAuth] - Session exists:', !!session);
        log('[LinkedInOAuth] - Provider:', session?.user?.app_metadata?.provider);
        log('[LinkedInOAuth] - Provider token exists:', !!session从未