
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Users, Zap } from 'lucide-react';

const SecondarySection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black flex items-center justify-center py-20">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Main Content */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-amber-200">
            Continue Your Journey
          </h2>
          <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
            Your story doesn't end with a resume. It evolves into something legendary. 
            Transform your professional narrative into a commanding presence that opens doors, 
            creates opportunities, and establishes your empire.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto mb-16">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl p-8 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-4 rounded-xl mb-6 inline-block">
                <Award className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Elite Recognition</h3>
              <p className="text-white/70 leading-relaxed">
                Stand out in a crowded marketplace. Your AI-powered podcast becomes your signature calling card, 
                setting you apart from every other candidate.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl p-8 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-4 rounded-xl mb-6 inline-block">
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Network Expansion</h3>
              <p className="text-white/70 leading-relaxed">
                Your podcast becomes a conversation starter, networking tool, and relationship builder. 
                Connect with industry leaders who remember your story.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl p-8 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-4 rounded-xl mb-6 inline-block">
                <Zap className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Instant Impact</h3>
              <p className="text-white/70 leading-relaxed">
                From resume upload to professional podcast in minutes. No editing, no recording, 
                no complex setups. Just pure, automated excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className="text-center mb-16">
          <blockquote className="text-2xl md:text-3xl font-light text-white/80 italic max-w-4xl mx-auto leading-relaxed mb-8">
            "In a world where everyone sounds the same, the one who tells their story differently 
            becomes the one everyone remembers."
          </blockquote>
          <div className="w-20 h-0.5 bg-gradient-to-r from-purple-400 to-amber-400 mx-auto"></div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold px-12 py-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
          >
            Begin Your Transformation
          </Button>
          <p className="text-white/60 mt-6 text-lg">
            Join the exclusive circle of professionals who command attention
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecondarySection;
