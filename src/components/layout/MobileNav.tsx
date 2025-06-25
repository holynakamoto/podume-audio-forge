
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
    <div className="relative md:hidden">
      {/* Hamburger Menu Button */}
      <button
        className="relative z-50 p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <div className="w-5 h-5 flex flex-col justify-center space-y-1">
          <span className={cn(
            "block h-0.5 w-5 bg-amber-400 transition-all duration-300 transform origin-center",
            isOpen ? "rotate-45 translate-y-1" : ""
          )} />
          <span className={cn(
            "block h-0.5 w-5 bg-amber-400 transition-all duration-300",
            isOpen ? "opacity-0" : ""
          )} />
          <span className={cn(
            "block h-0.5 w-5 bg-amber-400 transition-all duration-300 transform origin-center",
            isOpen ? "-rotate-45 -translate-y-1" : ""
          )} />
        </div>
      </button>

      {/* Dropdown Menu */}
      <div className={cn(
        "absolute top-full right-0 mt-2 w-64 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-xl shadow-2xl border border-purple-600/30 backdrop-blur-xl transition-all duration-300 transform origin-top-right z-40",
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 p-4 border-b border-purple-600/30">
          <Headphones className="w-5 h-5 text-amber-400" />
          <span className="text-lg font-bold text-white tracking-tight">
            Podumé
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-2">
          {navLinks.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="group block px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-purple-700/50 rounded-lg transition-all duration-200 relative overflow-hidden"
            >
              <span className="relative z-10">{link.label}</span>
              {/* Hover effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="p-4 border-t border-purple-600/30">
          <Link to="/create" onClick={closeMenu}>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-2 px-4 rounded-lg text-sm transition-all duration-300 hover:scale-105">
              Create Podcast
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-2 right-2 opacity-10">
          <Headphones className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={closeMenu}
        />
      )}
    </div>
  );
};

export default MobileNav;
