
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Volume2 } from 'lucide-react';

const VideoShowcaseSection = () => {
  return (
    <section id="video-showcase" className="relative w-full h-screen overflow-hidden">
      {/* Background with purple/gold gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-amber-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-amber-400/20"></div>
      </div>
      
      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center py-4 sm:py-0">
        {/* Section Header - Hidden on mobile */}
        <div className="text-center mb-4 sm:mb-8 hidden sm:block">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 sm:mb-6">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-amber-300">
              Experience the
            </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400 mt-1 sm:mt-2">
              Podumé Advantage
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto px-4">
            Like a McLaren Speedtail racing through Monaco, your career deserves to move at lightning speed.
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-6xl mx-auto flex-1 flex items-center w-full">
          <div className="relative w-full rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/30 border border-purple-400/50 sm:border-2 sm:border-gradient-to-r sm:from-purple-400 sm:to-amber-400 p-0.5 sm:p-1">
            <div className="relative bg-black rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden aspect-video">
              {/* McLaren Speedtail Video */}
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
                poster="/placeholder.svg"
              >
                <source src="/social_holynakamoto_httpss.mj.run_81FNI7mL8s_create_a_cool_10_second_99b66743-ee67-4c2a-88c5-4ab18c2a94e3_2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video controls overlay */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Button 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20 text-sm px-3 py-2"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/10 p-2"
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-white text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                  0:10
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements - hidden on mobile for cleaner look */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-amber-500 rounded-full opacity-60 blur-xl hidden sm:block"></div>
          <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full opacity-40 blur-xl hidden sm:block"></div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-4 sm:mt-8">
          <p className="text-base sm:text-lg text-slate-300 mb-4 sm:mb-6 px-4 hidden sm:block">
            Ready to accelerate your career with the same precision?
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold px-6 sm:px-8 py-4 sm:py-6 rounded-xl sm:rounded-2xl text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Create Your Podumé Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcaseSection;
