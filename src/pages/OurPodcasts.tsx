import React from 'react';
import { PublicAudioGallery } from '@/components/PublicAudioGallery';

const OurPodcasts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-amber-950/30">
      <div className="pt-8 pb-16">
        <PublicAudioGallery />
      </div>
    </div>
  );
};

export default OurPodcasts;