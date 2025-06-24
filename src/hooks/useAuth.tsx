
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

// Input sanitization function
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Password strength validation
const isStrongPassword = (password: string): boolean => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

export const useAuth = (redirectUrl: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const sendWelcomeEmail = async (email: string, name?: string) => {
    try {
      console.log('Attempting to send welcome email to:', email);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase.functions.invoke('send-welcome-email', {
          body: { email, name }
        });
        
        if (error) {
          console.error('Welcome email error:', error);
        } else {
          console.log('Welcome email sent successfully:', data);
        }
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  };

  const sendFallbackConfirmationEmail = async (email: string) => {
    try {
      console.log('Sending fallback confirmation email to:', email);
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: { 
          email,
          token: 'manual-confirmation',
          token_hash: 'manual-hash',
          redirect_to: window.location.origin,
          email_action_type: 'signup'
        }
      });
      
      if (error) {
        console.error('Fallback confirmation email error:', error);
      } else {
        console.log('Fallback confirmation email sent:', data);
      }
    } catch (error) {
      console.error('Failed to send fallback confirmation email:', error);
    }
  };

  const handleSignUp = async (values: { email: string; password: string; fullName: string }) => {
    setIsLoading(true);
    try {
      // Enhanced input validation and sanitization
      if (!values.email || !values.password || !values.fullName) {
        toast.error('All fields are required');
        return;
      }

      const sanitizedEmail = sanitizeInput(values.email.toLowerCase());
      const sanitizedName = sanitizeInput(values.fullName);

      if (!isValidEmail(sanitizedEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      if (!isStrongPassword(values.password)) {
        toast.error('Password must be at least 8 characters with uppercase, lowercase, and number');
        return;
      }

      if (sanitizedName.length < 2 || sanitizedName.length > 100) {
        toast.error('Full name must be between 2 and 100 characters');
        return;
      }

      console.log('Attempting to sign up user:', sanitizedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: values.password,
        options: {
          data: {
            full_name: sanitizedName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        await logSecurityEvent('auth_signup_failed', { 
          email: sanitizedEmail, 
          error: error.message 
        });
        
        // Enhanced error handling
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('invalid email')) {
          toast.error('Please enter a valid email address');
        } else {
          toast.error(error.message);
        }
      } else {
        console.log('Sign up successful:', data);
        await logSecurityEvent('auth_signup_success', { 
          email: sanitizedEmail 
        });
        
        // Send multiple email attempts for better delivery
        if (data.user && !data.user.email_confirmed_at) {
          console.log('User needs email confirmation, sending emails...');
          
          // Send welcome email as primary method
          await sendWelcomeEmail(sanitizedEmail, sanitizedName);
          
          // Send fallback confirmation email
          setTimeout(() => {
            sendFallbackConfirmationEmail(sanitizedEmail);
          }, 2000);
        }
        
        toast.success('Account created! Please check your email for the confirmation link.');
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      await logSecurityEvent('auth_signup_error', { 
        email: values.email?.toLowerCase() || 'unknown', 
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
      // Enhanced input validation
      if (!values.email || !values.password) {
        toast.error('Email and password are required');
        return;
      }

      const sanitizedEmail = sanitizeInput(values.email.toLowerCase());

      if (!isValidEmail(sanitizedEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: values.password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        await logSecurityEvent('auth_signin_failed', { 
          email: sanitizedEmail, 
          error: error.message 
        });
        
        // Enhanced error handling
        if (error.message.includes('invalid credentials')) {
          toast.error('Invalid email or password');
        } else if (error.message.includes('email not confirmed')) {
          toast.error('Please check your email and confirm your account first');
        } else {
          toast.error(error.message);
        }
      } else {
        await logSecurityEvent('auth_signin_success', { 
          email: sanitizedEmail 
        });
        toast.success('Signed in successfully!');
        navigate(redirectUrl);
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      await logSecurityEvent('auth_signin_error', { 
        email: values.email?.toLowerCase() || 'unknown', 
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
