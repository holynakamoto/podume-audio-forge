
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { LinkedInPodcastForm } from '@/components/form/LinkedInPodcastForm';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { Loader2 } from 'lucide-react';

const Create = () => {
    const { user, isLoading, isSignedIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && !isSignedIn) {
            navigate('/auth');
        }
    }, [isSignedIn, isLoading, navigate]);

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
