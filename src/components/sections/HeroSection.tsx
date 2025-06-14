
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="hero" className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-yellow-900/20"></div>
        </div>
        
        {/* Floating Audio Equipment */}
        <div className="absolute top-20 right-10 hidden lg:block opacity-20 hover:opacity-40 transition-opacity duration-500">
          <img 
            src="/lovable-uploads/4253ea4e-a6e4-47ba-a43e-d17cc47a16a5.png" 
            alt="Professional Audio Equipment" 
            className="w-32 h-auto animate-pulse"
          />
        </div>
        
        <div className="absolute bottom-20 left-10 hidden lg:block opacity-20 hover:opacity-40 transition-opacity duration-500">
          <img 
            src="/lovable-uploads/7e304183-92dc-46c7-9da9-1f941d0c7cd0.png" 
            alt="Luxury Headphones" 
            className="w-28 h-auto animate-pulse"
          />
        </div>

        <div className="container relative z-10 text-center px-4 md:px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-yellow-400/20 blur-3xl rounded-full"></div>
              <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-purple-200 to-yellow-200 mb-6">
                Turn Your Resume into a Podcast.
              </h1>
            </div>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                Stand out in a crowded job market. We use AI to transform your resume into a professional, shareable podcast episode in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/create">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <Button size="lg" className="relative w-full sm:w-auto bg-gradient-to-r from-purple-600 to-yellow-400 hover:from-purple-500 hover:to-yellow-300 text-white font-semibold px-8 py-6 rounded-full text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg shadow-purple-500/30">
                          Create Your Podcast Now
                      </Button>
                    </div>
                </Link>
                <a href="#features">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-8 py-6 rounded-full text-lg transition-transform duration-300 ease-in-out hover:scale-105 border-2 border-purple-500/50 hover:bg-purple-500/10 hover:border-yellow-400/50 text-purple-300 hover:text-yellow-300">
                        Learn More <MoveRight className="ml-2 h-5 w-5" />
                    </Button>
                </a>
            </div>
        </div>
    </section>
  );
};

export default HeroSection;
