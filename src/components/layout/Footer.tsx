
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1 lg:col-span-2">
            <Logo />
            <p className="text-muted-foreground max-w-xs">The future of personal branding is audio. Transform your resume into a compelling podcast today.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
              <li><a href="/#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
              <li><a href="/#faq" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
              <li><Link to="/create" className="text-muted-foreground hover:text-foreground">Create Podcast</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-4">Connect</h4>
             <div className="flex gap-4">
              <a href="https://twitter.com/Podume_Hire" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter /></a>
              <a href="https://github.com/holynakamoto/podume-audio-forge" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-muted-foreground hover:text-foreground"><Github /></a>
              <a href="https://linkedin.com/company/podume" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Podumé. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
