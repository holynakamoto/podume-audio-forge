import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface LiquidGlassTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export const LiquidGlassTabs: React.FC<LiquidGlassTabsProps> = ({ 
  tabs, 
  defaultTab,
  className 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={cn("w-full", className)}>
      {/* Tab Navigation */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 mb-6">
        {/* Animated background for active tab */}
        <div 
          className={cn(
            "absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out",
            "bg-gradient-to-r from-white/20 to-white/15 backdrop-blur-sm",
            "border border-white/30 shadow-lg"
          )}
          style={{
            left: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`,
            width: `${100 / tabs.length}%`,
            marginLeft: '0.25rem',
            marginRight: '0.25rem',
          }}
        />
        
        <div className="relative flex">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 py-3 px-4",
                "text-sm font-normal tracking-tight transition-all duration-200",
                "rounded-xl relative z-10",
                activeTab === tab.id 
                  ? "text-white/95" 
                  : "text-white/60 hover:text-white/80",
                "hover:scale-105"
              )}
            >
              {/* Hover glow */}
              {hoveredTab === tab.id && activeTab !== tab.id && (
                <div className="absolute inset-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" />
              )}
              
              {tab.icon && (
                <span className={cn(
                  "transition-all duration-200",
                  activeTab === tab.id ? "text-white/90" : "text-white/50"
                )}>
                  {tab.icon}
                </span>
              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={cn(
        "relative bg-white/12 backdrop-blur-xl border border-white/20",
        "rounded-2xl shadow-xl p-6",
        "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
        "before:bg-gradient-to-br before:from-white/30 before:via-white/10 before:to-white/30",
        "before:-z-10",
        "font-inter font-normal tracking-tight",
        "animate-fade-in"
      )}>
        {/* Content glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-teal-500/5 -z-10" />
        
        <div className="relative z-10 text-white/80">
          {activeTabContent}
        </div>
      </div>
    </div>
  );
};