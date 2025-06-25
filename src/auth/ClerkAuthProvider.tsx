
import { createContext, useContext, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ClerkAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();

  const value = {
    user,
    isLoading: !isLoaded,
    isSignedIn: !!isSignedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a ClerkAuthProvider');
  }
  return context;
};
