
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Users, DollarSign, Play } from 'lucide-react';
import { useIntent } from './IntentProvider';

interface ContextualCTAProps {
  position: 'floating' | 'inline' | 'sticky';
  className?: string;
}

export const ContextualCTA: React.FC<ContextualCTAProps> = ({ position, className = '' }) => {
  const { userIntent, trackInteraction } = useIntent();

  const getCTAContent = () => {
    const highEngagement = userIntent.engagementLevel === 'high';
    const timeOnSite = userIntent.timeOnSite;
    
    // High-intent users who have been browsing for a while
    if (highEngagement && timeOnSite > 60) {
      return {
        text: "Ready to get started? Let's create your podcast!",
        action: "Create Now - 50% Off First Episode",
        icon: Sparkles,
        urgency: true,
        variant: 'primary' as const
      };
    }
    
    // Users interested in pricing
    if (userIntent.primaryGoal === 'pricing') {
      return {
        text: "Special offer for new creators",
        action: "Start Your Podcast - $3.99",
        icon: DollarSign,
        urgency: true,
        variant: 'primary' as const
      };
    }
    
    // Community-focused users
    if (userIntent.primaryGoal === 'join_community') {
      return {
        text: "Connect with like-minded professionals",
        action: "Join Our Community",
        icon: Users,
        urgency: false,
        variant: 'secondary' as const
      };
    }
    
    // Users who engaged with samples
    if (userIntent.sectionsViewed.includes('sample')) {
      return {
        text: "Liked what you heard?",
        action: "Create Your Own Podcast",
        icon: Sparkles,
        urgency: false,
        variant: 'primary' as const
      };
    }
    
    // Default for engaged users
    if (timeOnSite > 30) {
      return {
        text: "Ready to stand out?",
        action: "Create Your Podcast",
        icon: ArrowRight,
        urgency: false,
        variant: 'primary' as const
      };
    }
    
    return null;
  };

  const ctaContent = getCTAContent();
  
  if (!ctaContent) return null;

  const handleClick = () => {
    trackInteraction('contextual_cta_click');
    // Navigation logic would go here
  };

  const baseClasses = {
    floating: "fixed bottom-6 right-6 z-50 shadow-2xl",
    inline: "w-full max-w-md mx-auto",
    sticky: "sticky top-20 z-40 bg-black/80 backdrop-blur-lg p-4 border-b border-purple-400/30"
  };

  const Icon = ctaContent.icon;

  return (
    <div className={`${baseClasses[position]} ${className}`}>
      <div className={`${ctaContent.urgency ? 'animate-pulse' : ''} relative group`}>
        {ctaContent.urgency && (
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
        )}
        
        <div className="relative bg-gradient-to-r from-purple-900/90 to-slate-900/90 backdrop-blur-lg border border-purple-400/50 rounded-2xl p-4">
          {ctaContent.urgency && (
            <div className="text-amber-400 text-sm font-medium mb-2 flex items-center">
              ⚡ Limited Time Offer
            </div>
          )}
          
          <p className="text-white text-sm mb-3">{ctaContent.text}</p>
          
          <Button
            onClick={handleClick}
            className={`w-full ${
              ctaContent.variant === 'primary' 
                ? 'bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400' 
                : 'bg-white/10 hover:bg-white/20 border border-white/20'
            } text-white font-medium transition-all duration-300 hover:scale-105`}
          >
            <Icon className="mr-2 h-4 w-4" />
            {ctaContent.action}
          </Button>
        </div>
      </div>
    </div>
  );
};
