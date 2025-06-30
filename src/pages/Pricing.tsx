
import React from 'react';
import { PremiumPricingSection } from '@/components/pricing/PremiumPricingSection';
import { SpaceHeroSection } from '@/components/sections/SpaceHeroSection';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-indigo-950/30">
      <SpaceHeroSection />
      <PremiumPricingSection />
    </div>
  );
};

export default Pricing;
