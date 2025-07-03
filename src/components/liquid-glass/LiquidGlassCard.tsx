import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  interactive?: boolean;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({ 
  children, 
  className,
  title,
  subtitle,
  interactive = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipple({ x, y, show: true });
    setTimeout(() => setRipple(prev => ({ ...prev, show: false })), 600);
  };

  return (
    <div 
      className={cn(
        "relative bg-white/12 backdrop-blur-xl border border-white/20",
        "rounded-2xl shadow-xl transition-all duration-300 ease-out",
        "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
        "before:bg-gradient-to-br before:from-white/30 before:via-white/10 before:to-white/30",
        "before:-z-10",
        "font-inter font-normal tracking-tight",
        "group overflow-hidden",
        interactive && "cursor-pointer hover:scale-105 hover:shadow-2xl",
        "animate-fade-in",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Prismatic glow on hover */}
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-opacity duration-500 -z-10 blur-xl",
        "bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-teal-500/20",
        isHovered ? "opacity-100" : "opacity-0"
      )} />
      
      {/* Cursor shimmer effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-opacity duration-300",
        "bg-gradient-to-r from-transparent via-white/10 to-transparent",
        "animate-pulse",
        isHovered ? "opacity-100" : "opacity-0"
      )} />

      {/* Ripple effect */}
      {ripple.show && (
        <div 
          className="absolute pointer-events-none rounded-full bg-white/30 animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      )}

      <div className="relative z-10 p-6">
        {(title || subtitle) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-white/90 font-medium text-lg tracking-tight mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-white/60 text-sm tracking-tight">
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className="text-white/80">
          {children}
        </div>
      </div>
    </div>
  );
};