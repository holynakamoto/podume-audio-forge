import Hero from '@/components/Hero';
import SecondarySection from '@/components/SecondarySection';
import HeroSection from '@/components/sections/HeroSection';
import SampleSection from '@/components/sections/SampleSection';
import PricingSection from '@/components/sections/PricingSection';
import CommunitySection from '@/components/sections/CommunitySection';

const Index = () => {
  return (
    <div className="bg-background text-foreground">
      <Hero />
      <HeroSection />
      <SecondarySection />
      <SampleSection />
      <CommunitySection />
      <PricingSection />
    </div>
  );
};

export default Index;
