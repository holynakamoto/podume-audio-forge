
import React from 'react';
import { Award } from 'lucide-react';

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
        <source src="https://github.com/holynakamoto/podume-audio-forge/blob/main/public/social_holynakamoto_httpss.mj.run_81FNI7mL8s_create_a_cool_10_second_99b66743-ee67-4c2a-88c5-4ab18c2a94e3_2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Navigation Bar */}
      <nav className="relative z-30 flex items-center justify-between p-8 lg:p-12">
        <div className="text-white font-light tracking-wide text-xl">
          Sandstorm®
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#mission" className="text-white/80 hover:text-white transition-colors duration-300">
            Mission
          </a>
          <a href="#chapter" className="text-white/80 hover:text-white transition-colors duration-300">
            Chapter
          </a>
          <a href="#about" className="text-white/80 hover:text-white transition-colors duration-300">
            About
          </a>
        </div>
        
        <button className="border border-white/30 hover:border-white/50 text-white/80 hover:text-white rounded-full px-6 py-2 transition-all duration-300">
          Watch Trailer
        </button>
      </nav>
      
      {/* Main Content Area */}
      <div className="relative z-20 flex-1 flex items-end pb-8 px-8 lg:pb-12 lg:px-12 mt-24">
        <div className="max-w-4xl">
          {/* Tagline */}
          <p className="text-white/60 text-sm font-light tracking-wide mb-6">
            The heat is nothing compared to what's coming.
          </p>
          
          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-light leading-none mb-8">
            <div className="text-white">Survive the Storm.</div>
            <div className="text-white/90">Rule the Desert.</div>
          </h1>
          
          {/* Paragraph */}
          <p className="lg:max-w-md text-white/70 font-light leading-relaxed text-lg">
            When the sand settles and the dust clears, only the strongest remain standing. 
            In this wasteland, survival isn't just about endurance—it's about domination.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
