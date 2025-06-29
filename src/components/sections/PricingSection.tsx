
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const subscriptionTiers = [
  {
    name: 'Monthly Plan',
    price: 7.99,
    period: 'month',
    description: 'Perfect for getting started with your personal brand.',
    features: [
      '1 AI Podcast Episode (5-10 minutes)',
      'Professional TTS Voice',
      'Auto-edited & Mixed',
      '3 Social Media Clips',
      'Distribution to Major Platforms',
      'Cancel anytime',
    ],
    isPopular: false,
  },
  {
    name: 'Yearly Plan',
    price: 79.99,
    period: 'year',
    monthlyEquivalent: 6.66,
    savings: '17% off',
    description: 'Best value for building your narrative consistently.',
    features: [
      'Everything in Monthly Plan',
      '12 Episodes per year',
      '36 Social Media Clips annually',
      'Priority Support',
      'Advanced Analytics',
      '2 months free (17% savings)',
    ],
    isPopular: true,
  },
];

const addons = [
  { name: 'Custom AI Voice Cloning', price: 29, description: 'One-time setup - mimic your own voice for all future episodes.' }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-background to-slate-50/5">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Apple-style centered header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-20">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-amber-200">
            Simple subscription pricing
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
            Choose the plan that fits your personal branding journey. Start building your narrative today.
          </p>
        </div>

        {/* Apple-style pricing grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-stretch max-w-5xl mx-auto mb-12 md:mb-20">
          {subscriptionTiers.map((tier) => (
            <div key={tier.name} className="relative group">
              {/* Apple-style glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-amber-600/10 rounded-2xl md:rounded-3xl blur-xl md:blur-2xl group-hover:blur-2xl md:group-hover:blur-3xl transition-all duration-700"></div>
              
              <Card className={cn(
                'relative bg-card/40 backdrop-blur-xl border-2 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 text-center flex flex-col h-full transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02] shadow-2xl hover:shadow-purple-500/20',
                tier.isPopular ? 'border-purple-400/60 ring-2 ring-purple-400/30' : 'border-white/20 hover:border-amber-400/40'
              )}>
                {tier.isPopular && (
                  <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 sm:px-6 md:px-8 py-2 md:py-3 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-purple-400 to-amber-400 rounded-full shadow-lg">
                      Most Popular - {tier.savings}
                    </div>
                  </div>
                )}

                <CardHeader className="pb-6 md:pb-8">
                  <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 md:mb-4">
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-base md:text-lg text-slate-300 leading-relaxed">
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow pb-6 md:pb-8">
                  {/* Apple-style price display */}
                  <div className="mb-8 md:mb-12">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white">
                        ${tier.price}
                      </span>
                      <div className="text-left">
                        <div className="text-slate-400 text-base md:text-lg">/{tier.period}</div>
                        {tier.monthlyEquivalent && (
                          <div className="text-slate-500 text-sm">
                            ~${tier.monthlyEquivalent}/month
                          </div>
                        )}
                      </div>
                    </div>
                    {tier.savings && (
                      <p className="text-amber-400 text-base md:text-lg font-semibold">{tier.savings}</p>
                    )}
                  </div>

                  {/* Apple-style feature list */}
                  <ul className="space-y-4 md:space-y-6 text-left max-w-sm mx-auto">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-purple-400 to-amber-400 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-black font-bold" />
                        </div>
                        <span className="text-slate-200 text-base md:text-lg leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-0">
                  <Link to="/create" className="w-full">
                    <Button 
                      size="lg" 
                      className={cn(
                        'w-full text-base md:text-lg font-bold py-4 md:py-6 rounded-xl md:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg',
                        tier.isPopular 
                          ? 'bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white' 
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40'
                      )}
                    >
                      Start {tier.name}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>

        {/* Apple-style add-ons section */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-8 md:mb-16 text-white">
            Optional Add-on
          </h3>
          <div className="flex justify-center">
            {addons.map(addon => (
              <div key={addon.name} className="relative group max-w-sm w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-amber-600/5 rounded-xl md:rounded-2xl blur-lg md:blur-xl group-hover:blur-xl md:group-hover:blur-2xl transition-all duration-500"></div>
                <Card className="relative bg-card/20 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl md:rounded-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 md:p-8 text-center">
                    <div className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text mb-3 md:mb-4">
                      ${addon.price}
                    </div>
                    <p className="font-bold text-lg md:text-xl text-white mb-2 md:mb-3">{addon.name}</p>
                    <p className="text-slate-300 leading-relaxed text-sm">{addon.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Value proposition */}
        <div className="text-center mt-12 md:mt-20 max-w-3xl mx-auto">
          <p className="text-base md:text-lg text-slate-300 leading-relaxed">
            Join thousands of professionals who've transformed their careers with AI-powered personal branding. 
            <span className="text-purple-400 font-semibold"> Cancel anytime, no hidden fees.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
