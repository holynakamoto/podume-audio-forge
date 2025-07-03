import React from 'react';
import { LiquidGlassNav, LiquidGlassToggle, LiquidGlassCard, LiquidGlassTabs } from '@/components/liquid-glass';
import { BarChart3, Users, TrendingUp, Settings, Activity, Zap } from 'lucide-react';

export default function LiquidGlassDemo() {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white/95 tracking-tight">Dashboard Overview</h3>
          <p className="text-white/70 leading-relaxed">
            Experience the future of user interfaces with Liquid Glass components. 
            This ultra-clean design system brings Apple VisionOS aesthetics to your web applications.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-medium text-white/95">2.4k</p>
                  <p className="text-sm text-white/60">Active Users</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-medium text-white/95">98.2%</p>
                  <p className="text-sm text-white/60">Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <Activity className="w-4 h-4" />,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-white/95 tracking-tight">Analytics Dashboard</h3>
          <p className="text-white/70 leading-relaxed">
            Real-time analytics with beautiful glass morphism effects and micro-interactions.
          </p>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/90">Performance Metrics</span>
              <span className="text-green-400 text-sm">+12.5%</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/70">CPU Usage</span>
                <span className="text-white/90">45%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-white/95 tracking-tight">System Settings</h3>
          <div className="space-y-4">
            <LiquidGlassToggle label="Dark Mode" checked={true} />
            <LiquidGlassToggle label="Notifications" checked={false} />
            <LiquidGlassToggle label="Auto-sync" checked={true} />
            <LiquidGlassToggle label="Analytics Tracking" checked={false} />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation */}
        <LiquidGlassNav />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cards Section */}
          <div className="lg:col-span-1 space-y-6">
            <LiquidGlassCard 
              title="Quick Stats" 
              subtitle="Real-time metrics"
              className="animate-fade-in"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Revenue</span>
                  <span className="text-white/90 font-medium">$24.7k</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Growth</span>
                  <span className="text-green-400 font-medium">+18.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Conversion</span>
                  <span className="text-white/90 font-medium">3.4%</span>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard 
              title="System Status" 
              subtitle="All systems operational"
              className="animate-fade-in delay-200"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-white/80">Online</span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">API Response</span>
                  <span className="text-white/80">142ms</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Database</span>
                  <span className="text-green-400">Healthy</span>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard 
              title="Quick Actions"
              className="animate-fade-in delay-400"
            >
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-105">
                  <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                  <span className="text-xs text-white/70">Deploy</span>
                </button>
                <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-105">
                  <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <span className="text-xs text-white/70">Users</span>
                </button>
              </div>
            </LiquidGlassCard>
          </div>

          {/* Tabs Section */}
          <div className="lg:col-span-2">
            <LiquidGlassTabs tabs={tabs} defaultTab="overview" className="animate-fade-in delay-300" />
          </div>
        </div>

        {/* Footer Card */}
        <LiquidGlassCard className="animate-fade-in delay-500">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white/95 tracking-tight mb-3">
              Liquid Glass Design System
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              A premium UI component library featuring glass morphism, micro-interactions, 
              and Apple VisionOS-inspired aesthetics. Perfect for modern SaaS applications 
              and luxury digital experiences.
            </p>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}