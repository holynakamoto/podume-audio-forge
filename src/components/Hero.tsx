
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Video Background - Optimized for mobile */}
      <video 
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay 
        muted 
        loop 
        playsInline
        poster="/placeholder.svg"
        style={{ minHeight: '100dvh' }}
      >
        <source src="https://cdn.midjourney.com/video/189e6117-bc79-48af-8c64-8acc4840b271/0.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Navigation Bar - Mobile Optimized */}
      <nav className="relative z-30 flex items-center justify-between p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="text-white font-light tracking-wide text-lg sm:text-xl md:text-2xl animate-fade-in">
          Podume®
        </div>
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Link to="/our-podcasts">
            <button className="smooth-hover bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 text-white rounded-full px-3 py-2 text-xs font-medium hover:scale-105 animate-fade-in delay-200">
              Podcasts
            </button>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <a href="#hero" className="smooth-hover text-white hover:text-amber-300 text-sm font-medium bg-white/20 px-4 xl:px-6 py-2.5 xl:py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 hover:scale-105">
            Features
          </a>
          <a href="#sample" className="smooth-hover text-white hover:text-amber-300 text-sm font-medium bg-white/20 px-4 xl:px-6 py-2.5 xl:py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 hover:scale-105">
            Sample
          </a>
          <a href="#community" className="smooth-hover text-white hover:text-amber-300 text-sm font-medium bg-white/20 px-4 xl:px-6 py-2.5 xl:py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 hover:scale-105">
            Community
          </a>
          <a href="#pricing" className="smooth-hover text-white hover:text-amber-300 text-sm font-medium bg-white/20 px-4 xl:px-6 py-2.5 xl:py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 hover:scale-105">
            Pricing
          </a>
          
          <Link to="/our-podcasts">
            <button className="smooth-hover bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 text-white rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium hover:scale-105 animate-fade-in delay-200">
              View Our Podcasts
            </button>
          </Link>
        </div>
      </nav>
      
      {/* Main Content Area - Mobile Optimized */}
      <div className="relative z-20 flex-1 flex items-end pb-8 sm:pb-12 md:pb-16 lg:pb-24 xl:pb-32 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-6xl w-full">
          {/* Moody Tagline - Mobile Responsive */}
          <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-12 animate-fade-in delay-400">
            <p className="text-white/60 text-xs sm:text-sm md:text-base font-light tracking-wide leading-relaxed">
              There is no competition, your story is a limited edition
            </p>
          </div>
          
          {/* Bold Two-Line Headline - Mobile Optimized */}
          <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20 animate-slide-up delay-600">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light leading-[0.85] tracking-tight">
              <div className="text-white mb-1 sm:mb-2 md:mb-3 lg:mb-4 animate-float">Purple Reign</div>
              <div className="text-white/75 animate-float" style={{ animationDelay: '0.5s' }}>Majesty</div>
            </h1>
          </div>
          
          {/* Story Paragraph - Mobile Responsive */}
          <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl animate-scale-fade-in delay-1000">
            <p className="text-white/70 font-light leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
              In a world where voices blend into the noise, yours cuts through like lightning. 
              This isn't just about being heard—it's about commanding attention, owning your narrative, 
              and turning your story into an empire.
            </p>
          </div>
          
          {/* Call to Action - Mobile Friendly */}
          <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 animate-fade-in delay-1200">
            <Link to="/create">
              <button className="smooth-hover bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300">
                Create Your Podcast
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
