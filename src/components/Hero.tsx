
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Video Background */}
      <video 
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay 
        muted 
        loop 
        playsInline
        poster="/placeholder.svg"
      >
        <source src="https://cdn.midjourney.com/video/189e6117-bc79-48af-8c64-8acc4840b271/0.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>
      
      {/* Navigation Bar */}
      <nav className="relative z-30 flex items-center justify-between p-4 sm:p-6 md:p-8 lg:p-12">
        <div className="text-white font-light tracking-wide text-lg sm:text-xl md:text-2xl animate-fade-in">
          Podume®
        </div>
        
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
        </div>
        
        <Link to="/our-podcasts">
          <button className="smooth-hover bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 text-white rounded-full px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium hover:scale-105 animate-fade-in delay-200">
            View Our Podcasts
          </button>
        </Link>
      </nav>
      
      {/* Main Content Area - Anchored to Bottom */}
      <div className="relative z-20 flex-1 flex items-end pb-12 sm:pb-16 px-4 sm:px-6 md:pb-24 md:px-8 lg:pb-32 lg:px-12">
        <div className="max-w-6xl w-full">
          {/* Moody Tagline */}
          <div className="mb-6 sm:mb-8 md:mb-12 animate-fade-in delay-400">
            <p className="text-white/60 text-xs sm:text-sm md:text-base font-light tracking-wide">
              There is no competition, your story is a limited edition
            </p>
          </div>
          
          {/* Bold Two-Line Headline with Enhanced Typography */}
          <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 animate-slide-up delay-600">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-light leading-[0.85] tracking-tight">
              <div className="text-white mb-2 sm:mb-3 md:mb-4 animate-float">Purple Reign</div>
              <div className="text-white/75 animate-float" style={{ animationDelay: '0.5s' }}>Majesty</div>
            </h1>
          </div>
          
          {/* Story Paragraph with Premium Spacing */}
          <div className="max-w-xl sm:max-w-2xl animate-scale-fade-in delay-1000">
            <p className="text-white/70 font-light leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
              In a world where voices blend into the noise, yours cuts through like lightning. 
              This isn't just about being heard—it's about commanding attention, owning your narrative, 
              and turning your story into an empire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
