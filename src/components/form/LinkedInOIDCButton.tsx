import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface LinkedInOIDCButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const LinkedInOIDCButton: React.FC<LinkedInOIDCButtonProps> = ({ 
  onSuccess, 
  className, 
  children = "Sign in with LinkedIn" 
}) => {
  const handleLinkedInSignIn = async () => {
    try {
      console.log('Starting LinkedIn OIDC sign-in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/create`,
          queryParams: {
            scope: 'openid profile email',
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('LinkedIn OIDC sign-in error:', error);
        toast.error(`LinkedIn sign-in failed: ${error.message}`);
        return;
      }
      
      console.log('LinkedIn OIDC sign-in initiated successfully');
      toast.success('Redirecting to LinkedIn...');
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Unexpected error during LinkedIn sign-in:', error);
      toast.error(`Unexpected error: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Button 
      onClick={handleLinkedInSignIn}
      className={className}
      variant="outline"
    >
      <svg 
        className="w-5 h-5 mr-2" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      {children}
    </Button>
  );
};