
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { LinkedInPodcastForm } from '@/components/form/LinkedInPodcastForm';

const Create = () => {
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
