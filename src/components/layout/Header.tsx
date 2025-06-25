
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-8 max-w-7xl">
        {/* Logo section - Notion-style */}
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        
        {/* Navigation - Notion-style centered */}
        <nav className="hidden items-center gap-8 md:flex">
          <a 
            href="/#features" 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 py-2 px-1"
          >
            Features
          </a>
          <a 
            href="/#sample" 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 py-2 px-1"
          >
            Sample
          </a>
          <a 
            href="/#pricing" 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 py-2 px-1"
          >
            Pricing
          </a>
          <a 
            href="/#faq" 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200 py-2 px-1"
          >
            FAQ
          </a>
        </nav>
        
        {/* CTA Button - Notion-style */}
        <Link to="/create">
          <Button className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 shadow-lg hover:shadow-purple-500/25 border-0">
            Create Podcast
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
