
import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import SampleSection from '@/components/sections/SampleSection';
import VideoShowcaseSection from '@/components/sections/VideoShowcaseSection';
import PricingSection from '@/components/sections/PricingSection';
import FaqSection from '@/components/sections/FaqSection';
import WaitlistSection from '@/components/sections/WaitlistSection';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/chat/ChatBot';

const Index = () => {
  return (
    <div className="bg-background text-foreground flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
        <SampleSection />
        <VideoShowcaseSection />
        <PricingSection />
        <WaitlistSection />
        <FaqSection />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
};

export default Index;
