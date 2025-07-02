
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const SecondarySection = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation();
  const { ref: quoteRef, isVisible: quoteVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-black flex items-center justify-center py-16 sm:py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        {/* Main Content with Premium Spacing */}
        <div ref={headerRef} className={`text-center mb-16 sm:mb-20 md:mb-24 lg:mb-32 ${headerVisible ? 'animate-slide-up' : ''}`}>
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black tracking-tight leading-[0.9] bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-amber-200 px-4">
              Continue Your Journey
            </h2>
          </div>
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/70 leading-relaxed font-light">
              Your story doesn't end with a resume. It evolves into something legendary. 
              Transform your professional narrative into a commanding presence that opens doors, 
              creates opportunities, and establishes your empire.
            </p>
          </div>
        </div>

        {/* Features Grid with Premium Spacing */}
        <div ref={gridRef} className={`grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 max-w-7xl mx-auto mb-16 sm:mb-20 md:mb-24 lg:mb-32 ${gridVisible ? 'animate-scale-fade-in' : ''}`}>
          <div className="group relative smooth-hover hover-lift hover-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 inline-block">
                <Award className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-amber-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 sm:mb-6">Elite Recognition</h3>
              <p className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg xl:text-xl">
                Stand out in a crowded marketplace. Your AI-powered podcast becomes your signature calling card, 
                setting you apart from every other candidate.
              </p>
            </div>
          </div>

          <div className="group relative smooth-hover hover-lift hover-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 inline-block">
                <Users className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 sm:mb-6">Network Expansion</h3>
              <p className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg xl:text-xl">
                Your podcast becomes a conversation starter, networking tool, and relationship builder. 
                Connect with industry leaders who remember your story.
              </p>
            </div>
          </div>

          <div className="group relative smooth-hover hover-lift hover-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 inline-block">
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-amber-400" />
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-4 sm:mb-6">Instant Impact</h3>
              <p className="text-white/70 leading-relaxed text-sm sm:text-base lg:text-lg xl:text-xl">
                From resume upload to professional podcast in minutes. No editing, no recording, 
                no complex setups. Just pure, automated excellence.
              </p>
            </div>
          </div>
        </div>

        {/* Quote Section with Premium Spacing */}
        <div ref={quoteRef} className={`text-center mb-16 sm:mb-20 lg:mb-24 px-4 ${quoteVisible ? 'animate-fade-in' : ''}`}>
          <div className="mb-8 sm:mb-12">
            <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-white/80 italic max-w-5xl mx-auto leading-relaxed">
              "In a world where everyone sounds the same, the one who tells their story differently 
              becomes the one everyone remembers."
            </blockquote>
          </div>
          <div className="w-16 sm:w-20 lg:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-purple-400 to-amber-400 mx-auto rounded-full"></div>
        </div>

        {/* Call to Action with Enhanced Spacing */}
        <div ref={ctaRef} className={`text-center ${ctaVisible ? 'animate-scale-fade-in' : ''}`}>
          <div className="mb-6 sm:mb-8">
            <Link to="/create">
              <Button 
                size="lg"
                className="smooth-hover hover-glow bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 rounded-2xl sm:rounded-3xl text-base sm:text-lg lg:text-xl xl:text-2xl hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
              >
                Begin Your Transformation
              </Button>
            </Link>
          </div>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg xl:text-xl px-4">
            Join the exclusive circle of professionals who command attention
          </p>
        </div>
      </div>
    </section>
  );
};

export default SecondarySection;
