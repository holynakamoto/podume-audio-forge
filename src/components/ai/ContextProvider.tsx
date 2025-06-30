
import React, { createContext, useContext, ReactNode } from 'react';
import { useContextAwareness, UserContext } from '@/hooks/useContextAwareness';

interface ContextProviderProps {
  children: ReactNode;
}

interface ContextProviderValue {
  context: UserContext;
  trackPageView: (page: string) => void;
  trackInteraction: (type: string, data?: any) => void;
  getContextualInsights: () => any;
  updateContext: (context: UserContext) => void;
}

const ContextContext = createContext<ContextProviderValue | undefined>(undefined);

export const ContextProvider: React.FC<ContextProviderProps> = ({ children }) => {
  const contextAwareness = useContextAwareness();
  
  return (
    <ContextContext.Provider value={contextAwareness}>
      {children}
    </ContextContext.Provider>
  );
};

export const useContext = () => {
  const context = useContext(ContextContext);
  if (!context) {
    throw new Error('useContext must be used within a ContextProvider');
  }
  return context;
};
