import { useState, useEffect, useCallback, useRef } from 'react';
import { useIntent } from '@/components/intent/IntentProvider';

export interface UserContext {
  // User Behavior
  currentSession: {
    startTime: number;
    pageViews: string[];
    interactions: Array<{
      type: string;
      timestamp: number;
      data: any;
    }>;
    scrollBehavior: {
      averageTime: number;
      deepestScroll: number;
      backtrackCount: number;
    };
  };
  
  // User Preferences (inferred)
  preferences: {
    contentType: 'visual' | 'text' | 'audio' | 'mixed';
    engagementStyle: 'quick' | 'thorough' | 'exploratory';
    deviceUsage: 'mobile-first' | 'desktop-focused' | 'mixed';
    timeOfUse: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  
  // Conversation Context
  conversation: {
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'frustrated' | 'excited';
    complexityLevel: 'beginner' | 'intermediate' | 'advanced';
    helpNeeded: string[];
  };
  
  // Technical Context
  technical: {
    browserCapabilities: {
      webAudio: boolean;
      webGL: boolean;
      localStorage: boolean;
      serviceWorker: boolean;
    };
    networkSpeed: 'slow' | 'medium' | 'fast';
    deviceSpecs: {
      memory: number;
      cores: number;
      screenSize: { width: number; height: number };
    };
  };
  
  // Business Context
  business: {
    userJourney: 'discovery' | 'consideration' | 'trial' | 'conversion' | 'retention';
    painPoints: string[];
    goals: string[];
    urgency: 'low' | 'medium' | 'high';
  };
}

export const useContextAwareness = () => {
  console.log('useContextAwareness: Hook starting');
  
  const intentResult = useIntent();
  console.log('useContextAwareness: Intent result:', intentResult);
  
  const userIntent = intentResult?.userIntent;
  console.log('useContextAwareness: User intent:', userIntent);

  const [context, setContext] = useState<UserContext>({
    currentSession: {
      startTime: Date.now(),
      pageViews: [],
      interactions: [],
      scrollBehavior: {
        averageTime: 0,
        deepestScroll: 0,
        backtrackCount: 0
      }
    },
    preferences: {
      contentType: 'mixed',
      engagementStyle: 'thorough',
      deviceUsage: 'mixed',
      timeOfUse: 'afternoon'
    },
    conversation: {
      topics: [],
      sentiment: 'neutral',
      complexityLevel: 'intermediate',
      helpNeeded: []
    },
    technical: {
      browserCapabilities: {
        webAudio: false,
        webGL: false,
        localStorage: true,
        serviceWorker: false
      },
      networkSpeed: 'medium',
      deviceSpecs: {
        memory: 4,
        cores: 4,
        screenSize: { width: 1920, height: 1080 }
      }
    },
    business: {
      userJourney: 'discovery',
      painPoints: [],
      goals: [],
      urgency: 'medium'
    }
  });

  console.log('useContextAwareness: Context state:', context);

  // Track page views
  const trackPageView = useCallback((page: string) => {
    console.log('useContextAwareness: Tracking page view:', page);
    setContext(prev => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        pageViews: [...prev.currentSession.pageViews, page].slice(-10)
      }
    }));
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((type: string, data: any = {}) => {
    console.log('useContextAwareness: Tracking interaction:', type, data);
    const interaction = {
      type,
      timestamp: Date.now(),
      data
    };

    setContext(prev => {
      const newContext = {
        ...prev,
        currentSession: {
          ...prev.currentSession,
          interactions: [...prev.currentSession.interactions, interaction].slice(-50)
        }
      };

      // Analyze patterns after state update
      const recentInteractions = newContext.currentSession.interactions.slice(-10);
      
      // Infer engagement style
      const quickActions = recentInteractions.filter(i => 
        ['button_click', 'quick_nav'].includes(i.type)
      ).length;
      const thoroughActions = recentInteractions.filter(i => 
        ['long_read', 'detailed_view', 'form_fill'].includes(i.type)
      ).length;

      if (quickActions > thoroughActions * 2) {
        newContext.preferences.engagementStyle = 'quick';
      } else if (thoroughActions > quickActions) {
        newContext.preferences.engagementStyle = 'thorough';
      }

      return newContext;
    });
  }, []);

  // Detect technical capabilities
  useEffect(() => {
    console.log('useContextAwareness: Detecting technical capabilities');
    const detectCapabilities = async () => {
      const capabilities = {
        webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
        webGL: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          } catch {
            return false;
          }
        })(),
        localStorage: (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        })(),
        serviceWorker: 'serviceWorker' in navigator
      };

      // Estimate device specs
      const memory = (navigator as any).deviceMemory || 4;
      const cores = navigator.hardwareConcurrency || 4;
      const screenSize = {
        width: window.screen.width,
        height: window.screen.height
      };

      setContext(prev => ({
        ...prev,
        technical: {
          ...prev.technical,
          browserCapabilities: capabilities,
          deviceSpecs: {
            memory,
            cores,
            screenSize
          }
        }
      }));
    };

    detectCapabilities();
  }, []);

  // Detect network speed
  useEffect(() => {
    console.log('useContextAwareness: Detecting network speed');
    const detectNetworkSpeed = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const speed = connection.effectiveType === '4g' ? 'fast' : 
                     connection.effectiveType === '3g' ? 'medium' : 'slow';
        
        setContext(prev => ({
          ...prev,
          technical: {
            ...prev.technical,
            networkSpeed: speed
          }
        }));
      }
    };

    detectNetworkSpeed();
  }, []);

  // Analyze user journey stage - SIMPLIFIED to avoid infinite loops
  useEffect(() => {
    console.log('useContextAwareness: Analyzing user journey, userIntent:', userIntent);
    
    if (!userIntent) {
      console.log('useContextAwareness: No userIntent available');
      return;
    }
    
    try {
      const journey = userIntent.sectionsViewed?.includes('pricing') ? 'consideration' :
                     (userIntent.interactionCount || 0) > 10 ? 'trial' :
                     (userIntent.timeOnSite || 0) > 120 ? 'consideration' : 'discovery';

      console.log('useContextAwareness: Calculated journey:', journey);

      setContext(prev => ({
        ...prev,
        business: {
          ...prev.business,
          userJourney: journey
        }
      }));
    } catch (error) {
      console.error('useContextAwareness: Error analyzing user journey:', error);
    }
  }, [userIntent?.sectionsViewed, userIntent?.interactionCount, userIntent?.timeOnSite]);

  // Infer time of use
  useEffect(() => {
    console.log('useContextAwareness: Setting time of use');
    const hour = new Date().getHours();
    const timeOfUse = hour < 12 ? 'morning' :
                     hour < 17 ? 'afternoon' :
                     hour < 21 ? 'evening' : 'night';

    setContext(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        timeOfUse
      }
    }));
  }, []);

  // Generate contextual insights
  const getContextualInsights = useCallback(() => {
    console.log('useContextAwareness: Generating contextual insights');
    
    const insights = {
      urgency: context.business.urgency,
      preferredContent: context.preferences.contentType,
      deviceOptimization: context.preferences.deviceUsage,
      engagementLevel: userIntent?.engagementLevel || 'medium',
      journeyStage: context.business.userJourney,
      technicalCapabilities: context.technical.browserCapabilities,
      suggestions: [] as string[]
    };

    // Generate suggestions based on context
    if (context.business.userJourney === 'consideration' && userIntent?.engagementLevel === 'high') {
      insights.suggestions.push('Show pricing and trial options');
    }
    
    if (context.preferences.engagementStyle === 'quick' && context.technical.networkSpeed === 'slow') {
      insights.suggestions.push('Prioritize fast-loading, essential content');
    }
    
    if (context.preferences.timeOfUse === 'evening' && context.currentSession.interactions.length > 20) {
      insights.suggestions.push('User might be tired, offer simplified options');
    }

    return insights;
  }, [context, userIntent]);

  console.log('useContextAwareness: Returning hook values');

  return {
    context,
    trackPageView,
    trackInteraction,
    getContextualInsights,
    updateContext: setContext
  };
};
