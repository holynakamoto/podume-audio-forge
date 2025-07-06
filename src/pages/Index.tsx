
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
import { InvisibleUXProvider } from '@/components/invisible-ux/InvisibleUXProvider';
import { NaturalInput } from '@/components/invisible-ux/NaturalInput';
import { InvisibleGuardrails } from '@/components/invisible-ux/InvisibleGuardrails';
import { OutcomeFocusedWorkflow } from '@/components/invisible-ux/OutcomeFocusedWorkflow';
import { AdaptiveInterface } from '@/components/invisible-ux/AdaptiveInterface';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [detectedContent, setDetectedContent] = useState<string>('');
  const [contentType, setContentType] = useState<'text' | 'url' | 'file'>('text');
  const [showWorkflow, setShowWorkflow] = useState(false);
  const navigate = useNavigate();

  const handleContentDetected = (content: string, type: 'text' | 'url' | 'file' | 'voice') => {
    setDetectedContent(content);
    setContentType(type as 'text' | 'url' | 'file');
    setShowWorkflow(true);
    
    // If it's a simple case, we might navigate directly to create page
    if (type === 'file' || (type === 'url' && content.includes('linkedin'))) {
      navigate('/create', { state: { content, type } });
    }
  };

  const handleWorkflowComplete = (result: any) => {
    console.log('Workflow completed:', result);
    // Handle the completion - maybe navigate to results page
  };

  return (
    <IntentProvider>
      <InvisibleUXProvider>
        <ContextProvider>
          <div className="bg-background text-foreground overflow-x-hidden">
          {/* Original hero for video background, then dynamic hero */}
          <Hero />
          
          {/* Invisible UX: Natural Input Interface */}
          <div className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Create Your Podcast Naturally
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Just speak, type, or drop your content. We'll handle the rest.
                </p>
              </div>
              
              <NaturalInput onContentDetected={handleContentDetected} />
              
              {detectedContent && (
                <div className="mt-8 space-y-6">
                  <InvisibleGuardrails 
                    content={detectedContent}
                    contentType={contentType}
                  />
                  
                  {showWorkflow && (
                    <OutcomeFocusedWorkflow
                      content={detectedContent}
                      contentType={contentType}
                      onComplete={handleWorkflowComplete}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Adaptive Interface */}
          <div className="py-8">
            <div className="container mx-auto px-4">
              <AdaptiveInterface />
            </div>
          </div>
          
          {/* Premium Sections with Enhanced Spacing */}
          <div className="space-y-32 lg:space-y-40">
            <SmartContentPrioritizer sectionId="hero" priority="high">
              <div className="py-16 lg:py-24">
                <DynamicHeroSection />
              </div>
            </SmartContentPrioritizer>

            <SmartContentPrioritizer sectionId="secondary" priority="medium">
              <div className="py-16 lg:py-24">
                <SecondarySection />
              </div>
            </SmartContentPrioritizer>

            <SmartContentPrioritizer 
              sectionId="sample" 
              priority="high"
              showCondition={(intent) => intent.timeOnSite > 20 || intent.primaryGoal === 'create_podcast'}
            >
              <div className="py-20 lg:py-32">
                <SampleSection />
              </div>
            </SmartContentPrioritizer>

            <SmartContentPrioritizer 
              sectionId="community" 
              priority="medium"
              showCondition={(intent) => intent.engagementLevel !== 'low'}
            >
              <div className="py-16 lg:py-24">
                <CommunitySection />
              </div>
            </SmartContentPrioritizer>

            <SmartContentPrioritizer 
              sectionId="pricing" 
              priority="high"
              showCondition={(intent) => intent.timeOnSite > 30 || intent.primaryGoal === 'pricing'}
            >
              <div className="py-20 lg:py-32">
                <PricingSection />
              </div>
            </SmartContentPrioritizer>
          </div>

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
    </InvisibleUXProvider>
  </IntentProvider>
  );
};

export default Index;
