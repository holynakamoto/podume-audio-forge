
import { Upload, Bot, Share2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const steps = [
  {
    icon: <Upload className="h-10 w-10 text-primary" />,
    title: '1. Upload Your Resume',
    description: 'Simply upload your resume in PDF or Word format. Our system will instantly start analyzing your achievements and skills.',
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: '2. AI Crafts Your Story',
    description: "Our advanced AI generates a compelling script, records it with a professional voice, and produces a polished 5-10 minute podcast episode.",
  },
  {
    icon: <Share2 className="h-10 w-10 text-primary" />,
    title: '3. Share Your Podcast',
    description: "Receive your podcast episode along with shareable social media assets. Distribute it on Spotify, Apple Podcasts, and more to get noticed.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground mb-16">
            From resume to podcast in three simple steps. Fully automated, incredibly fast.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="bg-card/50 border-border p-8 text-center flex flex-col items-center hover:border-primary transition-all duration-300 transform hover:-translate-y-2">
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                {step.icon}
              </div>
              <CardHeader className="p-0">
                <CardTitle className="text-2xl font-semibold mb-2">{step.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
