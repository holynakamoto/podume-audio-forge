
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { LinkedInPodcastForm } from '@/components/form/LinkedInPodcastForm';

const Create = () => {
    console.log('[Create] Page rendered');
    
    try {
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
    } catch (error) {
        console.error('[Create] Error rendering page:', error);
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white text-center">
                    <h1 className="text-2xl mb-4">Something went wrong</h1>
                    <p className="text-gray-300">Please check the console for errors.</p>
                </div>
            </div>
        );
    }
};

export default Create;
