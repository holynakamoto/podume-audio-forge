import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Zap, 
  Star,
  Clock,
  Target,
  Brain
} from 'lucide-react';
import { useInvisibleUX } from './InvisibleUXProvider';
import { useIntent } from '@/components/intent/IntentProvider';

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  trigger: string;
}

interface PersonalizationInsight {
  type: string;
  value: string;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export const AdaptiveInterface: React.FC = () => {
  const { state, adaptToPreference } = useInvisibleUX();
  const { userIntent } = useIntent();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [insights, setInsights] = useState<PersonalizationInsight[]>([]);
  const [showPersonalization, setShowPersonalization] = useState(false);

  // Principle 10: Adapt to Evolving User Expectations
  useEffect(() => {
    const generateSmartSuggestions = () => {
      const newSuggestions: SmartSuggestion[] = [];

      // Time-based suggestions
      if (userIntent.timeOnSite > 60 && userIntent.interactionCount < 3) {
        newSuggestions.push({
          id: 'guided_tour',
          title: 'Quick Tutorial',
          description: 'Learn how to create your first podcast in 2 minutes',
          action: 'Start Tutorial',
          icon: <Lightbulb className="h-4 w-4" />,
          priority: 'high',
          trigger: 'extended_browsing'
        });
      }

      // Behavior-based suggestions
      if (userIntent.primaryGoal === 'create_podcast' && userIntent.engagementLevel === 'high') {
        newSuggestions.push({
          id: 'advanced_features',
          title: 'Pro Features',
          description: 'Unlock voice cloning and premium audio quality',
          action: 'Explore Pro',
          icon: <Star className="h-4 w-4" />,
          priority: 'medium',
          trigger: 'high_engagement'
        });
      }

      // Efficiency suggestions
      if (userIntent.interactionCount > 5) {
        newSuggestions.push({
          id: 'shortcuts',
          title: 'Productivity Boost',
          description: 'Use keyboard shortcuts and batch processing',
          action: 'Learn Shortcuts',
          icon: <Zap className="h-4 w-4" />,
          priority: 'medium',
          trigger: 'frequent_user'
        });
      }

      // Social proof suggestions
      if (userIntent.sectionsViewed.includes('community')) {
        newSuggestions.push({
          id: 'community_features',
          title: 'Join Community',
          description: 'Connect with other podcast creators',
          action: 'Join Now',
          icon: <Users className="h-4 w-4" />,
          priority: 'low',
          trigger: 'community_interest'
        });
      }

      // Goal-oriented suggestions
      if (userIntent.primaryGoal === 'pricing' && userIntent.scrollDepth > 80) {
        newSuggestions.push({
          id: 'personalized_demo',
          title: 'Custom Demo',
          description: 'See features tailored to your specific needs',
          action: 'Book Demo',
          icon: <Target className="h-4 w-4" />,
          priority: 'high',
          trigger: 'pricing_focus'
        });
      }

      setSuggestions(newSuggestions);
    };

    const generateInsights = () => {
      const newInsights: PersonalizationInsight[] = [
        {
          type: 'Engagement Pattern',
          value: userIntent.engagementLevel,
          confidence: 0.8,
          trend: userIntent.interactionCount > 3 ? 'increasing' : 'stable'
        },
        {
          type: 'Primary Interest',
          value: userIntent.primaryGoal,
          confidence: 0.7,
          trend: 'stable'
        },
        {
          type: 'Device Preference',
          value: userIntent.deviceType,
          confidence: 0.9,
          trend: 'stable'
        },
        {
          type: 'Session Duration',
          value: `${Math.round(userIntent.timeOnSite / 60)}m ${userIntent.timeOnSite % 60}s`,
          confidence: 1.0,
          trend: userIntent.timeOnSite > 120 ? 'increasing' : 'stable'
        }
      ];

      setInsights(newInsights);
    };

    generateSmartSuggestions();
    generateInsights();
  }, [userIntent]);

  // Principle 4: Leverage AI to Anticipate and Act
  const handleSuggestionAction = (suggestion: SmartSuggestion) => {
    // Adapt interface based on user preferences
    adaptToPreference('preferred_suggestions', suggestion.id);
    adaptToPreference('interaction_style', 'guided');
    
    // Execute the suggested action
    switch (suggestion.id) {
      case 'guided_tour':
        // Start tutorial
        break;
      case 'advanced_features':
        // Navigate to pro features
        break;
      case 'shortcuts':
        // Show shortcuts modal
        break;
      case 'community_features':
        // Navigate to community
        break;
      case 'personalized_demo':
        // Open demo scheduler
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'decreasing': return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default: return <Clock className="h-3 w-3 text-gray-600" />;
    }
  };

  if (suggestions.length === 0 && !showPersonalization) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-primary">Smart Suggestions</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPersonalization(!showPersonalization)}
                className="text-xs"
              >
                {showPersonalization ? 'Hide' : 'Show'} Insights
              </Button>
            </div>

            <div className="grid gap-3">
              {suggestions.slice(0, 2).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {suggestion.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{suggestion.title}</h4>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggestionAction(suggestion)}
                    className="text-xs"
                  >
                    {suggestion.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalization Insights */}
      {showPersonalization && insights.length > 0 && (
        <Card className="border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <h4 className="font-medium text-secondary">Personalization Insights</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {insights.map((insight, index) => (
                <div key={index} className="p-2 bg-muted/30 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{insight.type}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(insight.trend)}
                      <span className="text-xs text-muted-foreground">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm mt-1 capitalize">{insight.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              <p>These insights help us personalize your experience. Trust level: {state.trustLevel}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};