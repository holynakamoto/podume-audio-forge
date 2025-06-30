
import React, { useState, useEffect } from 'react';
import { MessageCircle, Brain, Lightbulb, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContextData } from '@/components/ai/ContextProvider';
import { useIntent } from '@/components/intent/IntentProvider';

interface ContextualSuggestion {
  id: string;
  type: 'guidance' | 'feature' | 'content' | 'optimization';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action?: () => void;
}

export const ContextAwareAssistant = () => {
  const { context, getContextualInsights, trackInteraction } = useContextData();
  const { userIntent } = useIntent();
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Generate contextual suggestions
  useEffect(() => {
    const insights = getContextualInsights();
    const newSuggestions: ContextualSuggestion[] = [];

    // Journey-based suggestions
    if (insights.journeyStage === 'discovery') {
      newSuggestions.push({
        id: 'discovery-guide',
        type: 'guidance',
        title: 'Welcome! Let me show you around',
        description: 'Based on your browsing, I can help you understand how Podumé works.',
        priority: 'high'
      });
    }

    if (insights.journeyStage === 'consideration' && userIntent.sectionsViewed.includes('pricing')) {
      newSuggestions.push({
        id: 'pricing-help',
        type: 'guidance',
        title: 'Questions about pricing?',
        description: 'I can explain our packages and help you choose the right one.',
        priority: 'high'
      });
    }

    // Technical optimization suggestions
    if (context.technical.networkSpeed === 'slow') {
      newSuggestions.push({
        id: 'slow-network',
        type: 'optimization',
        title: 'Optimizing for your connection',
        description: 'I notice you\'re on a slower connection. Let me prioritize essential content.',
        priority: 'medium'
      });
    }

    // Engagement-based suggestions
    if (userIntent.engagementLevel === 'high' && userIntent.timeOnSite > 60) {
      newSuggestions.push({
        id: 'high-engagement',
        type: 'feature',
        title: 'Ready to create your podcast?',
        description: 'You seem very interested! Would you like me to guide you through creating your first podcast?',
        priority: 'high'
      });
    }

    // Time-based suggestions
    if (context.preferences.timeOfUse === 'evening' && context.currentSession.interactions.length > 15) {
      newSuggestions.push({
        id: 'evening-session',
        type: 'guidance',
        title: 'Take a quick path?',
        description: 'It\'s getting late. Let me show you the fastest way to get started.',
        priority: 'medium'
      });
    }

    // Device-specific suggestions
    if (userIntent.deviceType === 'mobile') {
      newSuggestions.push({
        id: 'mobile-optimization',
        type: 'optimization',
        title: 'Mobile-optimized experience',
        description: 'I\'ve optimized the interface for your mobile device.',
        priority: 'low'
      });
    }

    setSuggestions(newSuggestions.slice(0, 3)); // Show top 3 suggestions
  }, [context, userIntent, getContextualInsights]);

  // Auto-show assistant based on context
  useEffect(() => {
    const shouldShow = 
      userIntent.timeOnSite > 30 || 
      userIntent.engagementLevel === 'high' ||
      suggestions.some(s => s.priority === 'high');

    if (shouldShow && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [userIntent, suggestions, isVisible]);

  const handleSuggestionClick = (suggestion: ContextualSuggestion) => {
    trackInteraction('ai_suggestion_click', { 
      suggestionId: suggestion.id, 
      type: suggestion.type 
    });

    if (suggestion.action) {
      suggestion.action();
    } else {
      // Default actions based on type
      switch (suggestion.id) {
        case 'discovery-guide':
          // Scroll to how it works section
          document.getElementById('sample')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case 'high-engagement':
          // Navigate to create page
          window.location.href = '/create';
          break;
        case 'pricing-help':
          // Scroll to pricing
          document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          break;
      }
    }
  };

  const getContextSummary = () => {
    const insights = getContextualInsights();
    return {
      status: insights.engagementLevel,
      journey: insights.journeyStage,
      device: userIntent.deviceType,
      timeOnSite: Math.round(userIntent.timeOnSite)
    };
  };

  if (!isVisible || suggestions.length === 0) return null;

  const contextSummary = getContextSummary();

  return (
    <div className="fixed bottom-20 right-6 z-40 max-w-sm">
      <Card className="bg-gradient-to-br from-purple-900/95 to-slate-900/95 backdrop-blur-lg border border-purple-400/30 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-sm">
            <Brain className="h-4 w-4 text-purple-400" />
            AI Assistant
            <Badge variant="secondary" className="ml-auto text-xs">
              Context-Aware
            </Badge>
          </CardTitle>
          <div className="flex gap-2 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {contextSummary.status}
            </span>
            <span>•</span>
            <span>{contextSummary.journey}</span>
            <span>•</span>
            <span>{contextSummary.timeOnSite}s</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id}
              className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white text-sm font-medium">
                      {suggestion.title}
                    </h4>
                    <Badge 
                      variant={suggestion.priority === 'high' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-xs">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
            className="w-full text-gray-400 hover:text-white"
          >
            Dismiss
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
