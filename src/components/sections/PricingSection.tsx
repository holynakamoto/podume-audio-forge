
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Core Package',
    price: 99,
    description: 'Perfect for getting started and making an impact.',
    features: [
      'One 5-10 min AI Podcast Episode',
      'Professional TTS Voice',
      'Auto-edited & Mixed',
      'Basic Social Media Asset Pack',
      'Distribution to Major Platforms',
    ],
    isPopular: false,
  },
  {
    name: 'Upsell Package',
    price: 199,
    description: 'For those who want to build a narrative.',
    features: [
      'Everything in Core, plus:',
      '3-Episode Podcast Series',
      'OR Video Podcast with AI Visuals',
      'Premium Social Media Assets',
      'Personalized Intro/Outro',
    ],
    isPopular: true,
  },
];

const addons = [
    { name: 'Custom AI Voice Cloning', price: 29, description: 'Mimic your own voice for a personal touch.'},
    { name: 'Premium Social Assets', price: 19, description: 'Extra animated graphics and audiograms.'}
]

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground mb-16">
            Choose the plan that fits your goals. No hidden fees.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
          {tiers.map((tier) => (
            <Card key={tier.name} className={cn('flex flex-col h-full bg-card/50', tier.isPopular && 'border-primary ring-2 ring-primary shadow-lg shadow-primary/20')}>
              {tier.isPopular && (
                <div className="px-3 py-1 text-sm text-white bg-primary rounded-t-lg -m-px text-center font-semibold">Most Popular</div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-extrabold tracking-tighter">${tier.price}</span>
                  <span className="text-muted-foreground">/ one-time</span>
                </div>
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to="/create" className="w-full">
                  <Button size="lg" className={cn('w-full text-lg py-6', !tier.isPopular && 'bg-accent text-accent-foreground hover:bg-accent/80')}>
                    Get Started
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">Optional Add-ons</h3>
            <div className="grid md:grid-cols-2 gap-6">
                {addons.map(addon => (
                     <Card key={addon.name} className="bg-card/50">
                        <CardContent className="p-6 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-lg">{addon.name}</p>
                                <p className="text-sm text-muted-foreground">{addon.description}</p>
                            </div>
                            <p className="text-2xl font-bold text-primary">${addon.price}</p>
                        </CardContent>
                     </Card>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
