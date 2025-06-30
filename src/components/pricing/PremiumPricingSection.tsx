
import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const premiumTiers = [
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    description: 'Perfect for personal branding',
    features: [
      '3 AI Podcast Episodes',
      'Premium Voice Synthesis',
      'Auto-editing & Mastering',
      '9 Social Media Clips',
      'Multi-platform Distribution',
      'Analytics Dashboard',
    ],
    isPopular: false,
    gradient: 'from-slate-600 to-slate-700',
    highlight: 'slate-400',
  },
  {
    name: 'Professional',
    price: 79,
    period: 'month',
    description: 'For serious content creators',
    features: [
      'Unlimited Podcast Episodes',
      'Custom Voice Cloning',
      'Advanced Audio Processing',
      'Unlimited Social Clips',
      'Priority Distribution',
      'Advanced Analytics',
      'Brand Voice Training',
      'Custom Intro/Outro',
    ],
    isPopular: true,
    gradient: 'from-purple-600 to-indigo-600',
    highlight: 'purple-400',
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'For teams and agencies',
    features: [
      'Everything in Professional',
      'Multi-user Collaboration',
      'White-label Solutions',
      'API Access',
      'Custom Integrations',
      'Dedicated Support',
      'Training & Onboarding',
      'Custom Contract Terms',
    ],
    isPopular: false,
    gradient: 'from-amber-500 to-orange-600',
    highlight: 'amber-400',
  },
];

export const PremiumPricingSection = () => {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="max-w-7xl mx-auto">
        {/* Premium header */}
        <div className="text-center mb-20 relative">
          <div className="inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 blur-2xl rounded-full scale-150"></div>
            <h2 className="relative text-7xl md:text-8xl font-light tracking-tight text-white mb-6">
              Premium
              <span className="block text-5xl md:text-6xl font-extralight text-purple-300 mt-2">
                Experiences
              </span>
            </h2>
          </div>
          <p className="text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Elevate your voice with our premium suite of AI-powered tools, 
            designed for creators who demand excellence.
          </p>
        </div>

        {/* Floating pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {premiumTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={cn(
                "relative group transition-all duration-700 hover:-translate-y-4",
                tier.isPopular ? "lg:-translate-y-8 scale-105" : "",
                index === 0 ? "animate-fade-in" : "",
                index === 1 ? "animate-fade-in delay-200" : "",
                index === 2 ? "animate-fade-in delay-400" : ""
              )}
            >
              {/* Floating glow effect */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r blur-2xl rounded-3xl opacity-60 group-hover:opacity-80 transition-all duration-700",
                `from-${tier.highlight}/20 to-${tier.highlight}/10`
              )}></div>
              
              {/* Popular badge */}
              {tier.isPopular && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-2xl backdrop-blur-sm border border-white/20">
                    <Star className="inline w-4 h-4 mr-2" />
                    Most Popular
                  </div>
                </div>
              )}

              <Card className="relative bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-3xl overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-3xl">
                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="text-2xl font-light text-white">
                      {tier.name}
                    </CardTitle>
                    <div className={cn(
                      "w-3 h-3 rounded-full bg-gradient-to-r",
                      tier.gradient
                    )}></div>
                  </div>
                  
                  {/* Premium price display */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-extralight text-white tracking-tight">
                        ${tier.price}
                      </span>
                      <span className="text-slate-400 font-light">/{tier.period}</span>
                    </div>
                    <p className="text-slate-400 font-light mt-2 leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="p-10 pt-0">
                  {/* Premium features list */}
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r flex items-center justify-center mt-0.5",
                          tier.gradient
                        )}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-slate-200 font-light leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Premium CTA */}
                  <Link to="/create" className="block">
                    <Button 
                      size="lg" 
                      className={cn(
                        'w-full text-white font-medium py-6 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-white/20 hover:border-white/40',
                        tier.isPopular 
                          ? `bg-gradient-to-r ${tier.gradient} hover:shadow-purple-500/25` 
                          : 'bg-white/10 hover:bg-white/20'
                      )}
                    >
                      {tier.isPopular ? (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Start Creating
                        </>
                      ) : (
                        `Choose ${tier.name}`
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Premium footer */}
        <div className="text-center mt-20">
          <div className="inline-block bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <p className="text-slate-300 font-light leading-relaxed max-w-2xl">
              All plans include our premium support, regular updates, and access to new features. 
              <span className="text-purple-400 font-medium"> No hidden fees, cancel anytime.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
