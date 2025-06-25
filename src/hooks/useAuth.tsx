
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

  const cleanupExistingUser = async (email: string) => {
    try {
      console.log('Cleaning up existing user for email:', email);
      const { error } = await supabase.functions.invoke('cleanup-users', {
        body: { email }
      });
      
      if (error) {
        console.error('Cleanup function error:', error);
        return false;
      }
      
      console.log('User cleanup completed successfully');
      return true;
    } catch (error) {
      console.error('Error calling cleanup function:', error);
      return false;
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

      // Always try to clean up existing users first
      console.log('Proactively cleaning up any existing users...');
      toast.info('Checking for existing accounts...');
      
      const cleanupSuccess = await cleanupExistingUser(sanitizedEmail);
      
      if (cleanupSuccess) {
        // Wait a moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Set redirect to our confirmation page
      const redirectTo = `${window.location.origin}/confirm`;

      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: values.password,
        options: {
          data: {
            full_name: sanitizedName,
          },
          emailRedirectTo: redirectTo,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // If user still exists after cleanup, try one more time
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          console.log('User still exists after cleanup, trying more aggressive cleanup...');
          toast.info('Cleaning up existing account, please wait...');
          
          const secondCleanupSuccess = await cleanupExistingUser(sanitizedEmail);
          
          if (secondCleanupSuccess) {
            // Wait longer for more thorough cleanup
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Retry signup one more time
            console.log('Retrying signup after second cleanup...');
            const { data: retryData, error: retryError } = await supabase.auth.signUp({
              email: sanitizedEmail,
              password: values.password,
              options: {
                data: {
                  full_name: sanitizedName,
                },
                emailRedirectTo: redirectTo,
              },
            });
            
            if (retryError) {
              console.error('Retry sign up error:', retryError);
              await logSecurityEvent('auth_signup_retry_failed', { 
                email: sanitizedEmail, 
                error: retryError.message 
              });
              toast.error(`Signup failed: ${retryError.message}`);
            } else {
              console.log('Retry sign up successful:', retryData);
              await logSecurityEvent('auth_signup_retry_success', { 
                email: sanitizedEmail 
              });
              
              if (retryData.user && !retryData.user.email_confirmed_at) {
                toast.success('Account created! Please check your email for the confirmation link.');
              } else {
                toast.success('Account created and confirmed! Redirecting...');
                navigate(redirectUrl);
              }
            }
          } else {
            toast.error('Unable to clean up existing account. Please try a different email or contact support.');
          }
        } else {
          await logSecurityEvent('auth_signup_failed', { 
            email: sanitizedEmail, 
            error: error.message 
          });
          
          // Enhanced error handling
          if (error.message.includes('invalid email')) {
            toast.error('Please enter a valid email address');
          } else {
            toast.error(error.message);
          }
        }
      } else {
        console.log('Sign up successful:', data);
        await logSecurityEvent('auth_signup_success', { 
          email: sanitizedEmail 
        });
        
        if (data.user && !data.user.email_confirmed_at) {
          toast.success('Account created! Please check your email for the confirmation link.');
        } else {
          toast.success('Account created and confirmed! Redirecting...');
          navigate(redirectUrl);
        }
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

      const { data, error } = await supabase.auth.signInWithPassword({
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
        console.log('Sign in successful:', data);
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
