
import React from 'react';
import { Podcast } from 'lucide-react';

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="bg-primary/20 p-2 rounded-lg">
      <Podcast className="h-6 w-6 text-primary" />
    </div>
    <span className="text-2xl font-bold tracking-tighter text-white">
      Podumé
    </span>
  </div>
);

export default Logo;
