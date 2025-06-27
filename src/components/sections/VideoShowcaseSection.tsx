
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
              {/* Placeholder for video - replace with actual video once uploaded */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-amber-900/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-amber-400/30 blur-3xl rounded-full scale-150"></div>
                    <div className="relative w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 to-amber-500 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">McLaren Speedtail × Podumé</h3>
                  <p className="text-slate-300">Purple & Gold. Speed & Precision.</p>
                  
                  {/* Upload instructions for when you have the video */}
                  <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-purple-400/20">
                    <p className="text-sm text-slate-400 mb-2">
                      Replace this placeholder by uploading your McLaren video:
                    </p>
                    <code className="text-xs text-amber-300">
                      /public/videos/mclaren-speedtail.mp4
                    </code>
                  </div>
                </div>
              </div>
              
              {/* Video element (hidden until you upload the actual video) */}
              <video 
                className="w-full h-full object-cover hidden"
                autoPlay 
                muted 
                loop 
                playsInline
                poster="/placeholder-mclaren.jpg"
              >
                <source src="/videos/mclaren-speedtail.mp4" type="video/mp4" />
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
                  0:05
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
