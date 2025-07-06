import React, { createContext, useContext, useState, useEffect } from 'react';
import { useIntent } from '@/components/intent/IntentProvider';

interface InvisibleUXState {
  userConfidence: number;
  anticipatedNeeds: string[];
  qualityScore: number;
  adaptivePreferences: Record<string, any>;
  isProcessing: boolean;
  lastAction: string | null;
  trustLevel: 'low' | 'medium' | 'high';
}

interface InvisibleUXContextType {
  state: InvisibleUXState;
  anticipateUserNeed: (need: string) => void;
  updateQualityScore: (score: number) => void;
  recordUserAction: (action: string) => void;
  adaptToPreference: (key: string, value: any) => void;
  setProcessing: (processing: boolean) => void;
}

const InvisibleUXContext = createContext<InvisibleUXContextType | undefined>(undefined);

export const InvisibleUXProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userIntent } = useIntent();
  const [state, setState] = useState<InvisibleUXState>({
    userConfidence: 0.5,
    anticipatedNeeds: [],
    qualityScore: 0.8,
    adaptivePreferences: {},
    isProcessing: false,
    lastAction: null,
    trustLevel: 'medium'
  });

  // Principle 4: Leverage AI to Anticipate and Act
  useEffect(() => {
    const anticipatedNeeds: string[] = [];
    
    if (userIntent.timeOnSite > 30 && userIntent.interactionCount < 2) {
      anticipatedNeeds.push('guide_to_creation');
    }
    
    if (userIntent.scrollDepth > 70 && userIntent.primaryGoal === 'unknown') {
      anticipatedNeeds.push('clarify_intent');
    }
    
    if (userIntent.sectionsViewed.includes('pricing') && userIntent.timeOnSite > 60) {
      anticipatedNeeds.push('personalized_demo');
    }
    
    if (userIntent.primaryGoal === 'create_podcast' && userIntent.timeOnSite > 45) {
      anticipatedNeeds.push('optimize_workflow');
    }
    
    setState(prev => ({
      ...prev,
      anticipatedNeeds,
      trustLevel: userIntent.interactionCount > 5 ? 'high' : 
                 userIntent.interactionCount > 2 ? 'medium' : 'low'
    }));
  }, [userIntent]);

  const anticipateUserNeed = (need: string) => {
    setState(prev => ({
      ...prev,
      anticipatedNeeds: [...prev.anticipatedNeeds, need]
    }));
  };

  const updateQualityScore = (score: number) => {
    setState(prev => ({
      ...prev,
      qualityScore: score,
      userConfidence: Math.min(prev.userConfidence + 0.1, 1.0)
    }));
  };

  const recordUserAction = (action: string) => {
    setState(prev => ({
      ...prev,
      lastAction: action,
      userConfidence: Math.min(prev.userConfidence + 0.05, 1.0)
    }));
  };

  const adaptToPreference = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      adaptivePreferences: {
        ...prev.adaptivePreferences,
        [key]: value
      }
    }));
  };

  const setProcessing = (processing: boolean) => {
    setState(prev => ({
      ...prev,
      isProcessing: processing
    }));
  };

  return (
    <InvisibleUXContext.Provider value={{
      state,
      anticipateUserNeed,
      updateQualityScore,
      recordUserAction,
      adaptToPreference,
      setProcessing
    }}>
      {children}
    </InvisibleUXContext.Provider>
  );
};

export const useInvisibleUX = () => {
  const context = useContext(InvisibleUXContext);
  if (!context) {
    throw new Error('useInvisibleUX must be used within an InvisibleUXProvider');
  }
  return context;
};