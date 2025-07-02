
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
      <nav className="relative z-30 flex items-center justify-between p-6 md:p-8 lg:p-12">
        <div className="text-white font-light tracking-wide text-xl md:text-2xl">
          Podume®
        </div>
        
        <div className="hidden lg:flex items-center space-x-8">
          <a href="#hero" className="text-white hover:text-amber-300 transition-colors duration-300 text-sm font-medium bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50">
            Features
          </a>
          <a href="#sample" className="text-white hover:text-amber-300 transition-colors duration-300 text-sm font-medium bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50">
            Sample
          </a>
          <a href="#community" className="text-white hover:text-amber-300 transition-colors duration-300 text-sm font-medium bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50">
            Community
          </a>
          <a href="#pricing" className="text-white hover:text-amber-300 transition-colors duration-300 text-sm font-medium bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50">
            Pricing
          </a>
        </div>
        
        <Link to="/our-podcasts">
          <button className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-amber-400/20 hover:border-amber-300/50 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-105">
            View Our Podcasts
          </button>
        </Link>
      </nav>
      
      {/* Main Content Area - Anchored to Bottom */}
      <div className="relative z-20 flex-1 flex items-end pb-16 px-6 md:pb-24 md:px-8 lg:pb-32 lg:px-12">
        <div className="max-w-6xl w-full">
          {/* Moody Tagline */}
          <div className="mb-8 md:mb-12">
            <p className="text-white/60 text-sm md:text-base font-light tracking-wide">
              There is no competition, your story is a limited edition
            </p>
          </div>
          
          {/* Bold Two-Line Headline with Enhanced Typography */}
          <div className="mb-12 md:mb-16 lg:mb-20">
            <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light leading-[0.85] tracking-tight">
              <div className="text-white mb-3 md:mb-4">Purple Reign</div>
              <div className="text-white/75">Majesty</div>
            </h1>
          </div>
          
          {/* Story Paragraph with Premium Spacing */}
          <div className="max-w-2xl">
            <p className="text-white/70 font-light leading-relaxed text-lg md:text-xl lg:text-2xl">
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
