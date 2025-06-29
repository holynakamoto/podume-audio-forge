
import { useState, useEffect, useCallback } from 'react';

export interface UserIntent {
  primaryGoal: 'create_podcast' | 'learn_more' | 'join_community' | 'pricing' | 'unknown';
  engagementLevel: 'low' | 'medium' | 'high';
  timeOnSite: number;
  scrollDepth: number;
  sectionsViewed: string[];
  interactionCount: number;
  isReturningUser: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const useIntentTracking = () => {
  const [userIntent, setUserIntent] = useState<UserIntent>({
    primaryGoal: 'unknown',
    engagementLevel: 'low',
    timeOnSite: 0,
    scrollDepth: 0,
    sectionsViewed: [],
    interactionCount: 0,
    isReturningUser: false,
    deviceType: 'desktop'
  });

  const [sessionStartTime] = useState(Date.now());

  // Track scroll depth
  const trackScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);
    
    setUserIntent(prev => ({
      ...prev,
      scrollDepth: Math.max(prev.scrollDepth, scrollPercent)
    }));
  }, []);

  // Track section visibility
  const trackSectionView = useCallback((sectionId: string) => {
    setUserIntent(prev => ({
      ...prev,
      sectionsViewed: prev.sectionsViewed.includes(sectionId) 
        ? prev.sectionsViewed 
        : [...prev.sectionsViewed, sectionId]
    }));
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((type: string) => {
    setUserIntent(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1
    }));
  }, []);

  // Determine primary goal based on behavior
  const determinePrimaryGoal = useCallback((intent: UserIntent): UserIntent['primaryGoal'] => {
    if (intent.sectionsViewed.includes('pricing') && intent.scrollDepth > 60) {
      return 'pricing';
    }
    if (intent.sectionsViewed.includes('community') && intent.timeOnSite > 30) {
      return 'join_community';
    }
    if (intent.interactionCount > 3 || intent.sectionsViewed.includes('sample')) {
      return 'create_podcast';
    }
    if (intent.timeOnSite > 45 && intent.scrollDepth > 50) {
      return 'learn_more';
    }
    return 'unknown';
  }, []);

  // Determine engagement level
  const determineEngagementLevel = useCallback((intent: UserIntent): UserIntent['engagementLevel'] => {
    const score = intent.timeOnSite * 0.1 + intent.scrollDepth * 0.3 + intent.interactionCount * 10;
    if (score > 50) return 'high';
    if (score > 20) return 'medium';
    return 'low';
  }, []);

  // Update time on site
  useEffect(() => {
    const interval = setInterval(() => {
      const timeOnSite = Math.round((Date.now() - sessionStartTime) / 1000);
      setUserIntent(prev => {
        const updated: UserIntent = {
          ...prev,
          timeOnSite,
          primaryGoal: determinePrimaryGoal({ ...prev, timeOnSite }),
          engagementLevel: determineEngagementLevel({ ...prev, timeOnSite })
        };
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, determinePrimaryGoal, determineEngagementLevel]);

  // Track scroll events
  useEffect(() => {
    window.addEventListener('scroll', trackScrollDepth);
    return () => window.removeEventListener('scroll', trackScrollDepth);
  }, [trackScrollDepth]);

  // Check if returning user
  useEffect(() => {
    const hasVisited = localStorage.getItem('podume_visited');
    setUserIntent(prev => ({
      ...prev,
      isReturningUser: !!hasVisited,
      deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
    }));
    
    if (!hasVisited) {
      localStorage.setItem('podume_visited', 'true');
    }
  }, []);

  return {
    userIntent,
    trackSectionView,
    trackInteraction
  };
};
