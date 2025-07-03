
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { LinkedInPodcastForm } from '@/components/form/LinkedInPodcastForm';

const Create = () => {
    console.log('[Create] Page rendered');
    console.log('[Create] Location:', window.location.href);
    console.log('[Create] Current route in Create page');
    
    try {
        return (
            <div className="min-h-screen relative overflow-hidden">
                {/* Apple-style gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100" />
                
                {/* Floating glass orbs for depth - responsive sizes */}
                <div className="absolute top-10 left-4 sm:top-20 sm:left-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-20 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-72 sm:h-72 bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500" />
                
                {/* Glass morphism overlay */}
                <div className="absolute inset-0 backdrop-blur-sm bg-white/10" />
                
                {/* Content container with liquid glass effect */}
                <div className="relative z-10 min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
                    {/* Logo with glass background - responsive positioning */}
                    <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-20">
                        <div className="backdrop-blur-xl bg-white/20 rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-white/30 shadow-2xl">
                            <Link to="/">
                                <Logo />
                            </Link>
                        </div>
                    </div>
                    
                    {/* Main content with liquid glass card - mobile optimized */}
                    <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mt-16 sm:mt-24 px-2 sm:px-0">
                        <div className="backdrop-blur-2xl bg-white/30 rounded-2xl sm:rounded-3xl border border-white/40 shadow-2xl p-4 sm:p-8 relative overflow-hidden">
                            {/* Inner glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-2xl sm:rounded-3xl" />
                            
                            {/* Shimmer effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-pulse" />
                            
                            {/* Content */}
                            <div className="relative z-10">
                                <LinkedInPodcastForm />
                            </div>
                        </div>
                    </div>
                    
                    {/* Floating elements for visual interest - responsive */}
                    <div className="absolute top-20 right-8 sm:top-32 sm:right-32 w-2 h-2 sm:w-4 sm:h-4 bg-white/40 rounded-full blur-sm animate-bounce" />
                    <div className="absolute bottom-20 left-8 sm:bottom-32 sm:left-32 w-1.5 h-1.5 sm:w-3 sm:h-3 bg-blue-300/40 rounded-full blur-sm animate-bounce delay-300" />
                    <div className="absolute top-1/3 right-8 sm:right-1/4 w-1 h-1 sm:w-2 sm:h-2 bg-purple-300/40 rounded-full blur-sm animate-bounce delay-700" />
                </div>
            </div>
        );
    } catch (error) {
        console.error('[Create] Error rendering page:', error);
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-8 border border-white/30 shadow-2xl text-center">
                    <h1 className="text-2xl mb-4 text-red-800">Something went wrong</h1>
                    <p className="text-red-600">Please check the console for errors.</p>
                </div>
            </div>
        );
    }
};

export default Create;
