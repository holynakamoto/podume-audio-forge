
import Hero from '@/components/Hero';
import SecondarySection from '@/components/SecondarySection';
import HeroSection from '@/components/sections/HeroSection';
import SampleSection from '@/components/sections/SampleSection';
import PricingSection from '@/components/sections/PricingSection';
import CommunitySection from '@/components/sections/CommunitySection';
import { IntentProvider } from '@/components/intent/IntentProvider';
import { DynamicHeroSection } from '@/components/intent/DynamicHeroSection';
import { ContextualCTA } from '@/components/intent/ContextualCTA';
import { SmartContentPrioritizer } from '@/components/intent/SmartContentPrioritizer';
import { ProgressiveDisclosure } from '@/components/intent/ProgressiveDisclosure';
import { ContextProvider } from '@/components/ai/ContextProvider';
import { ContextAwareAssistant } from '@/components/ai/ContextAwareAssistant';

const Index = () => {
  return (
    <IntentProvider>
      <ContextProvider>
        <div className="bg-background text-foreground">
          {/* Original hero for video background, then dynamic hero */}
          <Hero />
          
          <SmartContentPrioritizer sectionId="hero" priority="high">
            <DynamicHeroSection />
          </SmartContentPrioritizer>

          <SmartContentPrioritizer sectionId="secondary" priority="medium">
            <SecondarySection />
          </SmartContentPrioritizer>

          <SmartContentPrioritizer 
            sectionId="sample" 
            priority="high"
            showCondition={(intent) => intent.timeOnSite > 20 || intent.primaryGoal === 'create_podcast'}
          >
            <SampleSection />
          </SmartContentPrioritizer>

          <SmartContentPrioritizer 
            sectionId="community" 
            priority="medium"
            showCondition={(intent) => intent.engagementLevel !== 'low'}
          >
            <CommunitySection />
          </SmartContentPrioritizer>

          <SmartContentPrioritizer 
            sectionId="pricing" 
            priority="high"
            showCondition={(intent) => intent.timeOnSite > 30 || intent.primaryGoal === 'pricing'}
          >
            <PricingSection />
          </SmartContentPrioritizer>

          {/* Progressive Disclosure Elements */}
          <ProgressiveDisclosure 
            triggerCondition="timeOnSite" 
            threshold={45}
            delay={2}
          >
            <ContextualCTA position="floating" />
          </ProgressiveDisclosure>

          <ProgressiveDisclosure 
            triggerCondition="scrollDepth" 
            threshold={80}
          >
            <ContextualCTA position="sticky" />
          </ProgressiveDisclosure>

          {/* Context-Aware AI Assistant */}
          <ContextAwareAssistant />
        </div>
      </ContextProvider>
    </IntentProvider>
  );
};

export default Index;
