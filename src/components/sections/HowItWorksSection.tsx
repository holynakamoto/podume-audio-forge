
import { Upload, Bot, Share2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const steps = [
  {
    icon: <Upload className="h-12 w-12 text-amber-400" />,
    title: 'Upload & Transform',
    subtitle: 'Your story begins here',
    description: 'Upload your resume and watch as our AI discovers the narrative threads that make your career journey unique and compelling.',
  },
  {
    icon: <Bot className="h-12 w-12 text-purple-400" />,
    title: 'AI Crafts Your Voice',
    subtitle: 'Professional meets personal',
    description: "Our advanced AI doesn't just read your resume—it understands your achievements, crafts a compelling narrative, and produces a podcast that sounds authentically you.",
  },
  {
    icon: <Share2 className="h-12 w-12 text-amber-400" />,
    title: 'Share & Shine',
    subtitle: 'Your moment to be heard',
    description: "Get your professionally produced podcast along with social media assets. Share on LinkedIn, Spotify, Apple Podcasts, and beyond. Stand out from the crowd.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-gradient-to-b from-slate-950/50 to-slate-900/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-amber-200">
            How It Works
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed">
            From resume to podcast in <span className="text-amber-400 font-semibold">three simple steps</span>. 
            Fully automated, incredibly fast, uniquely yours.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Card className="relative bg-card/30 backdrop-blur-lg border-2 border-purple-400/30 hover:border-amber-400/50 rounded-3xl p-8 text-center flex flex-col items-center transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 shadow-2xl">
                <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-6 rounded-2xl mb-8 border border-white/10">
                  {step.icon}
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-2xl md:text-3xl font-bold mb-2 text-white">
                    {step.title}
                  </CardTitle>
                  <p className="text-amber-300 font-medium text-lg mb-4">{step.subtitle}</p>
                  <CardDescription className="text-slate-300 text-lg leading-relaxed">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
