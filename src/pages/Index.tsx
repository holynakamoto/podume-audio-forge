
import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import PricingSection from '@/components/sections/PricingSection';
import FaqSection from '@/components/sections/FaqSection';
import WaitlistSection from '@/components/sections/WaitlistSection';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
        <PricingSection />
        <WaitlistSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
