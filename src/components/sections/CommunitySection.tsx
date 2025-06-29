
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Calendar, Mic, ArrowRight } from 'lucide-react';

const CommunitySection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(to_right,#8B5CF6_1px,transparent_1px),linear-gradient(to_bottom,#F59E0B_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10"></div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-400/20 mb-6">
            <Users className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-medium">Join the Community</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-amber-200">
            Where Stories
            <span className="block text-purple-300">Connect Careers</span>
          </h2>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who've discovered that the best connections happen when 
            your story meets the right opportunity. Our community is where podcast resumes 
            become career catalysts.
          </p>
        </div>

        {/* Community Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl p-6 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-3 rounded-xl mb-4 inline-block">
                <Mic className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Audio First</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Share your podcast resume and listen to others' career stories in our audio-focused community spaces.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl p-6 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-3 rounded-xl mb-4 inline-block">
                <MessageCircle className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Matching</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Connect with recruiters and professionals who resonate with your story through organic matchmaking.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl p-6 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-3 rounded-xl mb-4 inline-block">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Events</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Join virtual meetups, resume workshops, and recruiter Q&As to expand your network and skills.
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-black/40 backdrop-blur-lg border border-white/10 hover:border-purple-400/50 rounded-2xl p-6 text-center transition-all duration-500 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-500/20 to-amber-500/20 p-3 rounded-xl mb-4 inline-block">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Industry Spaces</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Connect with professionals in your field through dedicated discussion spaces and interest groups.
              </p>
            </div>
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400 mb-2">
              12K+
            </div>
            <p className="text-white/60 text-sm">Active Members</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400 mb-2">
              3.2K
            </div>
            <p className="text-white/60 text-sm">Podcast Resumes</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400 mb-2">
              850+
            </div>
            <p className="text-white/60 text-sm">Successful Matches</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400 mb-2">
              120+
            </div>
            <p className="text-white/60 text-sm">Companies Hiring</p>
          </div>
        </div>

        {/* Featured Community Stories */}
        <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Community Success Stories</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative">
              <div className="absolute -top-2 -left-2 text-4xl text-purple-400/30 font-serif">"</div>
              <blockquote className="text-white/80 text-lg leading-relaxed mb-4 pl-6">
                My podcast resume got me noticed by three recruiters in my first week. The community feedback 
                helped me refine my story before I even applied anywhere.
              </blockquote>
              <div className="flex items-center gap-3 pl-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  SJ
                </div>
                <div>
                  <p className="text-white font-medium">Sarah Johnson</p>
                  <p className="text-white/60 text-sm">Marketing Manager → Tech Startup</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-2 -left-2 text-4xl text-amber-400/30 font-serif">"</div>
              <blockquote className="text-white/80 text-lg leading-relaxed mb-4 pl-6">
                As a recruiter, I've found candidates here that I never would have discovered through 
                traditional channels. Their stories immediately tell me if they're the right fit.
              </blockquote>
              <div className="flex items-center gap-3 pl-6">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  MR
                </div>
                <div>
                  <p className="text-white font-medium">Michael Rodriguez</p>
                  <p className="text-white/60 text-sm">Senior Talent Acquisition</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Community CTA */}
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
            Ready to Join the Conversation?
          </h3>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Start building meaningful professional connections through the power of your story. 
            Your next career opportunity is just one conversation away.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-bold px-8 py-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25"
              asChild
            >
              <a href="https://podume.circle.so/join?invitation_token=10b044bc1f8428d4d2bd8529219c45bbc56d3dfa-7eafbbb4-d82d-4de4-8c67-b77f4b5d3893" target="_blank" rel="noopener noreferrer">
                Join Community
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="font-bold px-8 py-6 rounded-2xl text-lg transition-all duration-300 ease-out hover:scale-105 border-2 border-amber-400/60 hover:bg-amber-400/20 hover:border-amber-300 text-amber-200 hover:text-amber-100 backdrop-blur-sm bg-white/5"
            >
              Explore Success Stories
            </Button>
          </div>
          
          <p className="text-white/50 text-sm mt-6">
            Free to join • Premium features available • Mobile app included
          </p>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
