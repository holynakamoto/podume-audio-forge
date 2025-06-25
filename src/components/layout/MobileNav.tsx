
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#sample", label: "Sample" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className="md:hidden relative z-50 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-105"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <span className={cn(
            "block h-0.5 bg-amber-400 transition-all duration-300 transform origin-center",
            isOpen ? "rotate-45 translate-y-1" : ""
          )} />
          <span className={cn(
            "block h-0.5 bg-amber-400 transition-all duration-300",
            isOpen ? "opacity-0" : ""
          )} />
          <span className={cn(
            "block h-0.5 bg-amber-400 transition-all duration-300 transform origin-center",
            isOpen ? "-rotate-45 -translate-y-1" : ""
          )} />
        </div>
      </button>

      {/* Full-Screen Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-40 transform transition-all duration-500 ease-in-out md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
          
          {/* Watermark logo */}
          <div className="absolute bottom-8 right-8 opacity-5">
            <Headphones className="w-48 h-48 text-amber-400" />
          </div>
        </div>

        {/* Menu Content */}
        <div className="relative h-full flex flex-col justify-center items-center px-8">
          {/* Close button */}
          <button
            className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-110"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-amber-400" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <Headphones className="w-8 h-8 text-amber-400" />
            <span className="text-3xl font-black text-white tracking-tight">
              Podumé
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-8">
            {navLinks.map((link, index) => (
              <div key={link.href} className="relative">
                <a
                  href={link.href}
                  onClick={closeMenu}
                  className="group block text-center"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-4xl font-bold text-white hover:text-amber-400 transition-all duration-300 transform group-hover:scale-110 block relative">
                    {link.label}
                    {/* Soundwave ripple effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse rounded-lg -z-10"></span>
                    {/* Underline animation */}
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 group-hover:w-full transition-all duration-500 rounded-full"></span>
                  </span>
                </a>
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="mt-16">
            <Link to="/create" onClick={closeMenu}>
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-amber-500/25">
                Create Podcast
              </Button>
            </Link>
          </div>

          {/* Decorative soundwave animation */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-amber-400 rounded-full animate-pulse opacity-60"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animationDelay: `${i * 200}ms`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeMenu}
        />
      )}
    </>
  );
};

export default MobileNav;
