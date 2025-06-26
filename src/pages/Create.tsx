
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

    // Handle LinkedIn OAuth callback and redirect logic
    useEffect(() => {
        const handleAuthCallback = async () => {
            console.log('=== Create Page Auth Callback Handler ===');
            console.log('Current URL:', window.location.href);
            console.log('URL hash:', window.location.hash);
            console.log('URL search:', window.location.search);
            
            // Check for OAuth callback parameters
            const urlParams = new URLSearchParams(window.location.search);
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            
            const hasOAuthCallback = urlParams.get('code') || 
                                   hashParams.get('access_token') || 
                                   urlParams.get('state') ||
                                   hashParams.get('state');
            
            // Check if we were redirected here from LinkedIn OAuth
            const storedRedirect = sessionStorage.getItem('linkedin_auth_redirect');
            const storedOrigin = sessionStorage.getItem('linkedin_auth_origin');
            
            // Force redirect to /create if we're not already there after OAuth
            if ((hasOAuthCallback || storedRedirect === '/create') && window.location.pathname !== '/create') {
                console.log('OAuth detected but not on /create page, redirecting...');
                const targetUrl = `${storedOrigin || window.location.origin}/create${window.location.search}${window.location.hash}`;
                window.location.href = targetUrl;
                return;
            }
            
            if (hasOAuthCallback || storedRedirect === '/create') {
                console.log('OAuth callback detected, processing...');
                
                // Clear the stored redirect
                sessionStorage.removeItem('linkedin_auth_redirect');
                sessionStorage.removeItem('linkedin_auth_origin');
                
                // Wait for OAuth session to be established
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                try {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    console.log('Session after OAuth callback:');
                    console.log('- Session exists:', !!session);
                    console.log('- Provider:', session?.user?.app_metadata?.provider);
                    console.log('- Provider token exists:', !!session?.provider_token);
                    console.log('- User ID:', session?.user?.id);
                    
                    if (session && session.provider_token) {
                        console.log('LinkedIn OAuth session established successfully');
                        // Clean up URL parameters
                        window.history.replaceState({}, document.title, '/create');
                    } else {
                        console.warn('OAuth callback detected but no valid session found');
                    }
                } catch (error) {
                    console.error('Error checking session after OAuth:', error);
                }
            }
        };

        // Run the callback handler
        handleAuthCallback();
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
