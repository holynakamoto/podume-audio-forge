
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="/#sample" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Sample</a>
          <a href="/#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="/#faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <Link to="/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 rounded-full transition-transform duration-300 ease-in-out hover:scale-105">
            Create Your Podcast
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
