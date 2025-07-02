
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecondarySection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black flex items-center justify-center py-24 lg:py-32">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Main Content with Premium Spacing */}
        <div className="text-center mb-24 lg:mb-32">
          <div className="mb-8 lg:mb-12">
            <h2 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-amber-200">
              Continue Your Journey
            </h2>
          </div>
          <div className="max-w-5xl mx-auto">
            <p className="text-xl md:text-2xl lg:text-3xl text-white/70 leading-relaxed font-light">
              Your story doesn't end with a resume. It evolves into something legendary. 
              Transform your professional narrative into a commanding presence that opens doors, 
              creates opportunities, and establishes your empire.
            </p>
          </div>
        </div>

        {/* Features Grid with Premium Spacing */}
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto mb-24 lg:mb-32">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-3xl p-10 lg:p-12 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-6 rounded-2xl mb-8 inline-block">
                <Award className="h-10 w-10 lg:h-12 lg:w-12 text-amber-400" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">Elite Recognition</h3>
              <p className="text-white/70 leading-relaxed text-lg lg:text-xl">
                Stand out in a crowded marketplace. Your AI-powered podcast becomes your signature calling card, 
                setting you apart from every other candidate.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-3xl p-10 lg:p-12 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-6 rounded-2xl mb-8 inline-block">
                <Users className="h-10 w-10 lg:h-12 lg:w-12 text-purple-400" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">Network Expansion</h3>
              <p className="text-white/70 leading-relaxed text-lg lg:text-xl">
                Your podcast becomes a conversation starter, networking tool, and relationship builder. 
                Connect with industry leaders who remember your story.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-3xl p-10 lg:p-12 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-6 rounded-2xl mb-8 inline-block">
                <Zap className="h-10 w-10 lg:h-12 lg:w-12 text-amber-400" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">Instant Impact</h3>
              <p className="text-white/70 leading-relaxed text-lg lg:text-xl">
                From resume upload to professional podcast in minutes. No editing, no recording, 
                no complex setups. Just pure, automated excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section with Premium Spacing */}
        <div className="text-center mb-20 lg:mb-24">
          <div className="mb-12">
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light text-white/80 italic max-w-5xl mx-auto leading-relaxed">
              "In a world where everyone sounds the same, the one who tells their story differently 
              becomes the one everyone remembers."
            </blockquote>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-amber-400 mx-auto rounded-full"></div>
        </div>

        {/* Call to Action with Enhanced Spacing */}
        <div className="text-center">
          <div className="mb-8">
            <Link to="/create">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold px-16 py-8 rounded-3xl text-xl lg:text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
              >
                Begin Your Transformation
              </Button>
            </Link>
          </div>
          <p className="text-white/60 text-lg lg:text-xl">
            Join the exclusive circle of professionals who command attention
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecondarySection;
