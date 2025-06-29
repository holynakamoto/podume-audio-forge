
import React from 'react';
import Header from '@/components/layout/Header';
import { RSSPodcastViewer } from '@/components/RSSPodcastViewer';

const OurPodcasts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-amber-950/30">
      <Header />
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <RSSPodcastViewer />
        </div>
      </div>
    </div>
  );
};

export default OurPodcasts;
