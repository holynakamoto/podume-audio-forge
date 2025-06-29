import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MoveRight, Sparkles, Users, DollarSign } from 'lucide-react';
import { useIntent } from './IntentProvider';

export const DynamicHeroSection = () => {
  const { userIntent, trackSectionView, trackInteraction } = useIntent();

  useEffect(() => {
    trackSectionView('hero');
  }, [trackSectionView]);

  const getHeroContent = () => {
    if (userIntent.isReturningUser) {
      return {
        headline: "Welcome Back!",
        subheadline: "Ready to create your next podcast episode?",
        primaryCTA: "Continue Creating",
        secondaryCTA: "View Your Podcasts",
        primaryIcon: Sparkles,
        secondaryIcon: MoveRight
      };
    }

    switch (userIntent.primaryGoal) {
      case 'pricing':
        return {
          headline: "Transform Your Resume Into Revenue",
          subheadline: "Start building your personal brand with AI-powered podcasting that converts.",
          primaryCTA: "See Pricing Plans",
          secondaryCTA: "Hear Sample First",
          primaryIcon: DollarSign,
          secondaryIcon: MoveRight
        };
      
      case 'join_community':
        return {
          headline: "Join Thousands of Career Storytellers",
          subheadline: "Connect with professionals who've transformed their careers through podcasting.",
          primaryCTA: "Join Community",
          secondaryCTA: "Create Your Story",
          primaryIcon: Users,
          secondaryIcon: Sparkles
        };
      
      case 'create_podcast':
        return {
          headline: "Your Story Deserves to Be Heard",
          subheadline: "Turn your professional journey into a compelling podcast that opens doors.",
          primaryCTA: "Create Your Podcast",
          secondaryCTA: "See How It Works",
          primaryIcon: Sparkles,
          secondaryIcon: MoveRight
        };
      
      default:
        return {
          headline: "Your Resume, Your Voice, Your Podcast.",
          subheadline: "Break through the noise. Stand out in a crowded job market with a professional podcast that tells your career story in your own voice.",
          primaryCTA: "Create Your Podcast Now",
          secondaryCTA: "Hear The Difference",
          primaryIcon: Sparkles,
          secondaryIcon: MoveRight
        };
    }
  };

  const content = getHeroContent();
  const PrimaryIcon = content.primaryIcon;
  const SecondaryIcon = content.secondaryIcon;

  const handlePrimaryCTA = () => {
    trackInteraction('primary_cta_click');
    // Navigation logic would go here
  };

  const handleSecondaryCTA = () => {
    trackInteraction('secondary_cta_click');
    // Navigation logic would go here
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background remains the same */}
      <div className="absolute top-0 left-0 -z-10 h-full w-full bg-gradient-to-br from-slate-950 via-purple-950/50 to-amber-950/30">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#F59E0B_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-amber-400/20"></div>
      </div>
      
      <div className="container relative z-10 text-center px-4 md:px-6 max-w-6xl">
        {/* Dynamic headline */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-amber-400/30 blur-3xl rounded-full scale-150"></div>
          <h1 className="relative text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-amber-100">
              {content.headline}
            </span>
          </h1>
        </div>
        
        {/* Dynamic subtitle */}
        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed mb-4">
            {content.subheadline}
          </p>
          {userIntent.engagementLevel === 'high' && (
            <p className="text-lg text-amber-300 font-light">
              🔥 You're clearly serious about this - let's make it happen!
            </p>
          )}
        </div>
        
        {/* Dynamic CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-300 group-hover:scale-110"></div>
            <Button 
              size="lg" 
              className="relative w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-bold px-10 py-8 rounded-2xl text-xl transition-all duration-300 ease-out hover:scale-105 shadow-2xl shadow-purple-500/30 border-2 border-white/20 hover:border-white/40"
              onClick={handlePrimaryCTA}
            >
              <PrimaryIcon className="mr-3 h-6 w-6" />
              {content.primaryCTA}
            </Button>
          </div>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto font-bold px-10 py-8 rounded-2xl text-xl transition-all duration-300 ease-out hover:scale-105 border-3 border-amber-400/60 hover:bg-amber-400/20 hover:border-amber-300 text-amber-200 hover:text-amber-100 backdrop-blur-sm bg-white/5 shadow-xl"
            onClick={handleSecondaryCTA}
          >
            <SecondaryIcon className="mr-3 h-6 w-6" />
            {content.secondaryCTA}
          </Button>
        </div>
        
        {/* Progressive disclosure - social proof */}
        {userIntent.timeOnSite > 15 && (
          <div className="text-center animate-fade-in">
            <p className="text-slate-400 text-sm font-medium mb-4">
              {userIntent.engagementLevel === 'high' 
                ? "Join 12,000+ professionals who've already transformed their careers" 
                : "Trusted by ambitious professionals worldwide"
              }
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="h-2 w-16 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full"></div>
              <div className="h-2 w-12 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full"></div>
              <div className="h-2 w-20 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full"></div>
              <div className="h-2 w-14 bg-gradient-to-r from-amber-400 to-purple-400 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
