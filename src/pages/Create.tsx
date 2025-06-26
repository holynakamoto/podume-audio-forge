
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { LinkedInPodcastForm } from '@/components/form/LinkedInPodcastForm';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Create = () => {
    const { user, isLoading, isSignedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isSignedIn) {
            navigate('/auth');
        }
    }, [isSignedIn, isLoading, navigate]);

    // Handle LinkedIn OAuth callback on page load
    useEffect(() => {
        const handleLinkedInCallback = async () => {
            console.log('=== Create Page OAuth Check ===');
            console.log('Current URL:', window.location.href);
            console.log('URL hash:', window.location.hash);
            console.log('URL search:', window.location.search);
            
            // Check if we have OAuth tokens in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            
            console.log('URL params:', Object.fromEntries(urlParams.entries()));
            console.log('Hash params:', Object.fromEntries(hashParams.entries()));
            
            // Check if this is a LinkedIn OAuth callback
            const hasOAuthCallback = urlParams.get('code') || 
                                   hashParams.get('access_token') || 
                                   urlParams.get('state') ||
                                   hashParams.get('state');
            
            if (hasOAuthCallback) {
                console.log('OAuth callback detected on create page');
                console.log('Waiting for session to be established...');
                
                // Wait a bit longer for OAuth session to be processed
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                try {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    console.log('Session after OAuth callback:');
                    console.log('- Session exists:', !!session);
                    console.log('- Provider:', session?.user?.app_metadata?.provider);
                    console.log('- Provider token exists:', !!session?.provider_token);
                    console.log('- Error:', error);
                    
                    if (session && session.provider_token) {
                        console.log('LinkedIn OAuth session established successfully');
                    } else {
                        console.warn('OAuth callback detected but no valid session found');
                    }
                } catch (error) {
                    console.error('Error checking session after OAuth:', error);
                }
            }
        };

        handleLinkedInCallback();
    }, []);

    if (isLoading || !isSignedIn) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground mt-4">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="absolute top-8 left-8">
                <Link to="/">
                    <Logo />
                </Link>
            </div>
            <div className="w-full max-w-4xl">
                <LinkedInPodcastForm />
            </div>
        </div>
    );
};

export default Create;
