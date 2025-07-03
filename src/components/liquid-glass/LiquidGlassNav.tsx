import React from 'react';
import { cn } from '@/lib/utils';
import { Search, Bell, User } from 'lucide-react';

interface LiquidGlassNavProps {
  className?: string;
}

export const LiquidGlassNav: React.FC<LiquidGlassNavProps> = ({ className }) => {
  return (
    <nav className={cn(
      "relative w-full h-16 bg-white/15 backdrop-blur-xl border border-white/20",
      "rounded-2xl shadow-xl",
      "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
      "before:bg-gradient-to-r before:from-white/30 before:via-white/10 before:to-white/30",
      "before:-z-10",
      "font-inter font-normal tracking-tight",
      "transition-all duration-300 ease-out",
      "hover:shadow-2xl hover:scale-105",
      "group",
      className
    )}>
      {/* Prismatic glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
      
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-white/40 to-white/20 rounded-xl backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <div className="w-4 h-4 bg-white/60 rounded-md"></div>
          </div>
          <span className="text-white/90 font-medium tracking-tight">Liquid Glass</span>
        </div>

        {/* Center Navigation */}
        <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
          {['Dashboard', 'Analytics', 'Settings'].map((item) => (
            <button
              key={item}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-lg"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 hover:scale-105">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 hover:scale-105">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200 hover:scale-105">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};