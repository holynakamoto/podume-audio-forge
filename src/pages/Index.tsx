
import Hero from '@/components/Hero';
import SecondarySection from '@/components/SecondarySection';
import HeroSection from '@/components/sections/HeroSection';
import SampleSection from '@/components/sections/SampleSection';
import PricingSection from '@/components/sections/PricingSection';

const Index = () => {
  return (
    <div className="bg-background text-foreground">
      <Hero />
      <HeroSection />
      <SecondarySection />
      <SampleSection />
      <PricingSection />
    </div>
  );
};

export default Index;
