import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface LiquidGlassToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  label?: string;
}

export const LiquidGlassToggle: React.FC<LiquidGlassToggleProps> = ({ 
  checked = false, 
  onChange, 
  className,
  label 
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {label && (
        <span className="text-white/90 font-normal tracking-tight text-sm">
          {label}
        </span>
      )}
      <button
        onClick={handleToggle}
        className={cn(
          "relative w-12 h-6 rounded-2xl transition-all duration-300 ease-out",
          "bg-white/10 backdrop-blur-md border border-white/20",
          "hover:scale-105 hover:shadow-xl",
          "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
          "before:bg-gradient-to-r before:from-white/30 before:via-white/10 before:to-white/30",
          "before:-z-10",
          "group",
          isChecked && "bg-gradient-to-r from-blue-500/30 to-purple-500/30"
        )}
      >
        {/* Prismatic glow */}
        <div className={cn(
          "absolute inset-0 rounded-2xl transition-opacity duration-500 -z-10 blur-lg",
          "bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-teal-500/40",
          isChecked ? "opacity-60" : "opacity-0 group-hover:opacity-30"
        )} />
        
        {/* Toggle handle */}
        <div className={cn(
          "absolute top-1 left-1 w-4 h-4 rounded-xl transition-all duration-300 ease-out",
          "bg-white/90 backdrop-blur-sm border border-white/30",
          "shadow-lg",
          isChecked && "translate-x-6 bg-white shadow-2xl"
        )}>
          {/* Handle glow */}
          <div className={cn(
            "absolute inset-0 rounded-xl transition-opacity duration-300",
            "bg-gradient-to-br from-blue-400/50 to-purple-400/50 blur-sm -z-10",
            isChecked ? "opacity-100" : "opacity-0"
          )} />
        </div>
      </button>
    </div>
  );
};