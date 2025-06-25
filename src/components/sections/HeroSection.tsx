
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoveRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="hero" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Enhanced background with warmer tones */}
        <div className="absolute top-0 left-0 -z-10 h-full w-full bg-gradient-to-br from-slate-950 via-purple-950/50 to-amber-950/30">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#F59E0B_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-amber-400/20"></div>
        </div>
        
        <div className="container relative z-10 text-center px-4 md:px-6 max-w-6xl">
            {/* Editorial-style headline with confident typography */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-amber-400/30 blur-3xl rounded-full scale-150"></div>
              <h1 className="relative text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-6">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-amber-100">
                  Your Resume,
                </span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-amber-300 to-purple-200 mt-2">
                  Your Voice,
                </span>
                <span className="block text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400 mt-4">
                  Your Podcast.
                </span>
              </h1>
            </div>
            
            {/* Joyful and confident subtitle */}
            <div className="max-w-3xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-4">
                <span className="text-amber-300 font-semibold">Break through the noise.</span> Stand out in a crowded job market with a professional podcast that tells your career story in your own voice.
              </p>
              <p className="text-lg text-slate-400 font-light">
                AI-powered. Professionally produced. Uniquely yours.
              </p>
            </div>
            
            {/* Tactile, interactive buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
                <Link to="/create">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-300 group-hover:scale-110"></div>
                      <Button size="lg" className="relative w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold px-10 py-8 rounded-2xl text-xl transition-all duration-300 ease-out hover:scale-105 shadow-2xl shadow-purple-500/30 border-2 border-white/20 hover:border-white/40">
                          <Sparkles className="mr-3 h-6 w-6" />
                          Create Your Podcast Now
                      </Button>
                    </div>
                </Link>
                <a href="#sample">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-bold px-10 py-8 rounded-2xl text-xl transition-all duration-300 ease-out hover:scale-105 border-3 border-amber-400/60 hover:bg-amber-400/20 hover:border-amber-300 text-amber-200 hover:text-amber-100 backdrop-blur-sm bg-white/5 shadow-xl">
                        <MoveRight className="mr-3 h-6 w-6" />
                        Hear The Difference
                    </Button>
                </a>
            </div>
            
            {/* Confident social proof */}
            <div className="text-center">
              <p className="text-slate-400 text-sm font-medium mb-4">Trusted by ambitious professionals worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="h-2 w-16 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full"></div>
                <div className="h-2 w-12 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full"></div>
                <div className="h-2 w-20 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full"></div>
                <div className="h-2 w-14 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full"></div>
              </div>
            </div>
        </div>
    </section>
  );
};

export default HeroSection;
