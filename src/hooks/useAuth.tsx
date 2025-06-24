
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const logSecurityEvent = async (eventType: string, eventData: any) => {
  try {
    await supabase.from('security_audit_log').insert({
      event_type: eventType,
      event_data: eventData,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const useAuth = (redirectUrl: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const sendWelcomeEmail = async (email: string, name?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.functions.invoke('send-welcome-email', {
          body: { email, name }
        });
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error here as it's not critical to the signup flow
    }
  };

  const handleSignUp = async (values: { email: string; password: string; fullName: string }) => {
    setIsLoading(true);
    try {
      // Input validation
      if (!values.email || !values.password || !values.fullName) {
        toast.error('All fields are required');
        return;
      }

      if (values.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      if (values.fullName.length > 100) {
        toast.error('Full name cannot exceed 100 characters');
        return;
      }

      console.log('Attempting to sign up user:', values.email);

      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          data: {
            full_name: values.fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        await logSecurityEvent('auth_signup_failed', { 
          email: values.email.trim().toLowerCase(), 
          error: error.message 
        });
        toast.error(error.message);
      } else {
        console.log('Sign up successful:', data);
        await logSecurityEvent('auth_signup_success', { 
          email: values.email.trim().toLowerCase() 
        });
        
        // Try to send welcome email as backup
        if (data.user && !data.user.email_confirmed_at) {
          console.log('Sending welcome email as backup...');
          await sendWelcomeEmail(values.email.trim().toLowerCase(), values.fullName.trim());
        }
        
        toast.success('Please check your email for the confirmation link!');
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      await logSecurityEvent('auth_signup_error', { 
        email: values.email.trim().toLowerCase(), 
        error: 'Unexpected error' 
      });
      toast.error('An unexpected error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      // Input validation
      if (!values.email || !values.password) {
        toast.error('Email and password are required');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        await logSecurityEvent('auth_signin_failed', { 
          email: values.email.trim().toLowerCase(), 
          error: error.message 
        });
        toast.error(error.message);
      } else {
        await logSecurityEvent('auth_signin_success', { 
          email: values.email.trim().toLowerCase() 
        });
        toast.success('Signed in successfully!');
        navigate(redirectUrl);
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      await logSecurityEvent('auth_signin_error', { 
        email: values.email.trim().toLowerCase(), 
        error: 'Unexpected error' 
      });
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
