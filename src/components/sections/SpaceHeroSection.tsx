
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const SpaceHeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Deep space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/80 via-indigo-950/60 to-black"></div>
      
      {/* Animated stars */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-purple-300 rounded-full opacity-80 animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-0.5 h-0.5 bg-indigo-300 rounded-full opacity-70 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse delay-3000"></div>
        <div className="absolute bottom-20 left-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-60 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-10 w-1 h-1 bg-indigo-200 rounded-full opacity-40 animate-pulse delay-1500"></div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-30 p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-white font-light text-2xl tracking-wide">
            Podume®
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white/70 hover:text-white transition-colors font-light">
              Home
            </Link>
            <Link to="/create" className="text-white/70 hover:text-white transition-colors font-light">
              Create
            </Link>
            <Link to="/our-podcasts" className="text-white/70 hover:text-white transition-colors font-light">
              Podcasts
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content with entrance animations */}
      <div className="relative z-20 max-w-6xl mx-auto px-8 text-center">
        <div className="animate-fade-in">
          {/* Glowing headline */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 blur-3xl rounded-full scale-150"></div>
            <h1 className="relative text-6xl md:text-8xl lg:text-9xl font-extralight tracking-tight leading-[0.85] text-white mb-8">
              <span className="block opacity-0 animate-[fade-in_1s_ease-out_0.5s_forwards]">
                Infinite
              </span>
              <span className="block bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent opacity-0 animate-[fade-in_1s_ease-out_1s_forwards]">
                Possibilities
              </span>
            </h1>
          </div>

          {/* Subtitle with glow */}
          <div className="max-w-3xl mx-auto mb-16 opacity-0 animate-[fade-in_1s_ease-out_1.5s_forwards]">
            <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed mb-6">
              Your voice deserves a premium stage. Create professional podcasts with 
              <span className="text-purple-300 font-normal"> AI-powered precision</span> and 
              <span className="text-indigo-300 font-normal"> studio-quality production</span>.
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-purple-400"></div>
              <span className="text-sm font-light">Premium Experience Awaits</span>
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-indigo-400"></div>
            </div>
          </div>

          {/* Premium CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 opacity-0 animate-[fade-in_1s_ease-out_2s_forwards]">
            <Link to="/create">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-70 group-hover:opacity-90 transition-all duration-500 group-hover:scale-110"></div>
                <Button 
                  size="lg" 
                  className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-12 py-8 rounded-2xl text-lg transition-all duration-500 hover:scale-105 shadow-2xl border border-white/20 hover:border-white/40 backdrop-blur-sm"
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  Begin Your Journey
                </Button>
              </div>
            </Link>
            
            <Link to="/our-podcasts">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/5 backdrop-blur-xl border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-medium px-12 py-8 rounded-2xl text-lg transition-all duration-500 hover:scale-105 shadow-xl"
              >
                <ArrowRight className="mr-3 h-5 w-5" />
                Explore Premium
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 opacity-0 animate-[fade-in_1s_ease-out_2.5s_forwards]">
          <div className="flex items-center justify-center gap-8">
            <div className="w-2 h-16 bg-gradient-to-b from-purple-400 to-transparent rounded-full opacity-60"></div>
            <div className="w-1 h-12 bg-gradient-to-b from-indigo-400 to-transparent rounded-full opacity-40"></div>
            <div className="w-2 h-20 bg-gradient-to-b from-violet-400 to-transparent rounded-full opacity-50"></div>
            <div className="w-1 h-14 bg-gradient-to-b from-purple-300 to-transparent rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
