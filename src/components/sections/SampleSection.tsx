
import { Play, Rewind, FastForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SampleSection = () => {
  return (
    <section id="sample" className="py-20 md:py-32 bg-gradient-to-br from-purple-900/20 via-card/30 to-yellow-900/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 bg-gradient-to-r from-purple-400 via-primary to-yellow-400 bg-clip-text text-transparent">
            Hear The Difference
          </h2>
          <p className="text-lg text-muted-foreground mb-16">
            Listen to a sample episode generated from a real resume. This could be you.
          </p>
        </div>
        
        {/* Premium Audio Equipment Display */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-yellow-400/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300">
              <img 
                src="/lovable-uploads/4253ea4e-a6e4-47ba-a43e-d17cc47a16a5.png" 
                alt="Podumé Premium Audio Equipment" 
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text">
                  Professional Grade Equipment
                </h3>
                <p className="text-muted-foreground mt-2">Studio-quality sound for your career story</p>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-600/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-card/80 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <img 
                src="/lovable-uploads/7e304183-92dc-46c7-9da9-1f941d0c7cd0.png" 
                alt="Podumé Luxury Headphones" 
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text">
                  Luxury Experience
                </h3>
                <p className="text-muted-foreground mt-2">Premium quality that stands out</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spotify Embed Player */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-primary/30 to-yellow-400/30 rounded-xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-card/90 to-purple-900/20 border border-purple-500/50 rounded-xl p-8 shadow-2xl shadow-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-600 to-yellow-400 p-1">
                  <div className="w-full h-full bg-card rounded-lg flex items-center justify-center">
                    <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text">
                      P
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-yellow-400 rounded-lg blur opacity-30"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text">
                  Disney Actress to Entertainment Pro
                </h3>
                <p className="text-muted-foreground">Carmi Harris's Career Journey</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Now Playing on Spotify</span>
                </div>
              </div>
            </div>
            
            {/* Spotify Embed */}
            <div className="rounded-xl overflow-hidden">
              <iframe 
                style={{borderRadius: '12px'}} 
                src="https://open.spotify.com/embed/episode/5XtZm7VPfWolx8MaPupbsI?utm_source=generator" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SampleSection
