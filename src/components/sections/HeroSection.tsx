
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section id="hero" className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-0 left-0 -z-10 h-full w-full bg-background">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>
        <div className="container relative z-10 text-center px-4 md:px-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 mb-6">
                Turn Your Resume into a Podcast.
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                Stand out in a crowded job market. We use AI to transform your resume into a professional, shareable podcast episode in minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/create">
                    <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-full text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg shadow-primary/30">
                        Create Your Podcast Now
                    </Button>
                </Link>
                <a href="#features">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold px-8 py-6 rounded-full text-lg transition-transform duration-300 ease-in-out hover:scale-105 border-2 border-border hover:bg-accent">
                        Learn More <MoveRight className="ml-2 h-5 w-5" />
                    </Button>
                </a>
            </div>
        </div>
    </section>
  );
};

export default HeroSection;
