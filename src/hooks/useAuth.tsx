
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = (redirectUrl: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (values: { email: string; password: string; fullName: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
      } else {
        toast.success('Check your email for the confirmation link!');
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully!');
        navigate(redirectUrl);
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast.error('An unexpected error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignUp,
    handleSignIn,
  };
};
