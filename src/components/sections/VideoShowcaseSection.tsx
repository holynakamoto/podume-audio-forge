
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Volume2 } from 'lucide-react';

const VideoShowcaseSection = () => {
  return (
    <section id="video-showcase" className="relative w-full py-20 overflow-hidden">
      {/* Background with purple/gold gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-amber-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-amber-400/20"></div>
      </div>
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-amber-300">
              Experience the
            </span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-purple-400 mt-2">
              Podumé Advantage
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Like a McLaren Speedtail racing through Monaco, your career deserves to move at lightning speed.
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/30 border-4 border-gradient-to-r from-purple-400 to-amber-400 p-1">
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
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
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Button 
                    size="sm" 
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/10"
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
          
          {/* Decorative elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-purple-600 to-amber-500 rounded-full opacity-60 blur-xl"></div>
          <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-r from-amber-500 to-purple-600 rounded-full opacity-40 blur-xl"></div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-slate-300 mb-6">
            Ready to accelerate your career with the same precision?
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold px-8 py-6 rounded-2xl text-lg transition-all duration-300 hover:scale-105 shadow-xl"
          >
            Create Your Podumé Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcaseSection;
