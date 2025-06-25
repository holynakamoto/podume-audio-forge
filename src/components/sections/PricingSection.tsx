
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
    <section id="pricing" className="py-24 md:py-32 bg-gradient-to-b from-background to-slate-50/5">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Apple-style centered header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-amber-200">
            Choose your plan
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            Simple, transparent pricing designed to help you share your story with the world.
          </p>
        </div>

        {/* Apple-style pricing grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-stretch max-w-5xl mx-auto mb-20">
          {tiers.map((tier) => (
            <div key={tier.name} className="relative group">
              {/* Apple-style glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-amber-600/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>
              
              <Card className={cn(
                'relative bg-card/40 backdrop-blur-xl border-2 rounded-3xl p-12 text-center flex flex-col h-full transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02] shadow-2xl hover:shadow-purple-500/20',
                tier.isPopular ? 'border-purple-400/60 ring-2 ring-purple-400/30' : 'border-white/20 hover:border-amber-400/40'
              )}>
                {tier.isPopular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="px-8 py-3 text-sm font-bold text-black bg-gradient-to-r from-purple-400 to-amber-400 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader className="pb-8">
                  <CardTitle className="text-3xl md:text-4xl font-black text-white mb-4">
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-300 leading-relaxed">
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow pb-8">
                  {/* Apple-style price display */}
                  <div className="mb-12">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-6xl md:text-7xl font-black tracking-tighter text-white">
                        ${tier.price}
                      </span>
                    </div>
                    <p className="text-slate-400 text-lg">one-time payment</p>
                  </div>

                  {/* Apple-style feature list */}
                  <ul className="space-y-6 text-left max-w-sm mx-auto">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-amber-400 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-black font-bold" />
                        </div>
                        <span className="text-slate-200 text-lg leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-0">
                  <Link to="/create" className="w-full">
                    <Button 
                      size="lg" 
                      className={cn(
                        'w-full text-lg font-bold py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg',
                        tier.isPopular 
                          ? 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white' 
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                      )}
                    >
                      Get {tier.name}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        {/* Apple-style add-ons section */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl md:text-5xl font-black text-center mb-16 text-white">
            Add-ons
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {addons.map(addon => (
              <div key={addon.name} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-amber-600/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <Card className="relative bg-card/20 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xl text-white mb-2">{addon.name}</p>
                      <p className="text-slate-300 leading-relaxed">{addon.description}</p>
                    </div>
                    <div className="text-3xl font-black text-transparent bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text ml-6">
                      ${addon.price}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
