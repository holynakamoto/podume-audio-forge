
import React, { createContext, useContext } from 'react';
import { useIntentTracking, UserIntent } from '@/hooks/useIntentTracking';

interface IntentContextType {
  userIntent: UserIntent;
  trackSectionView: (sectionId: string) => void;
  trackInteraction: (type: string) => void;
}

const IntentContext = createContext<IntentContextType | undefined>(undefined);

export const IntentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const intentTracking = useIntentTracking();
  
  return (
    <IntentContext.Provider value={intentTracking}>
      {children}
    </IntentContext.Provider>
  );
};

export const useIntent = () => {
  const context = useContext(IntentContext);
  if (!context) {
    throw new Error('useIntent must be used within an IntentProvider');
  }
  return context;
};
