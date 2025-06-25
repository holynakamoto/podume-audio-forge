
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get the token and type from URL params
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        if (!token || !type) {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try signing up again.');
          return;
        }

        console.log('Confirming email with token:', token, 'type:', type);

        // Use Supabase's verify method to confirm the email
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        });

        if (error) {
          console.error('Email confirmation error:', error);
          setStatus('error');
          
          if (error.message.includes('expired')) {
            setMessage('This confirmation link has expired. Please sign up again to receive a new confirmation email.');
          } else if (error.message.includes('invalid')) {
            setMessage('This confirmation link is invalid. Please sign up again to receive a new confirmation email.');
          } else {
            setMessage('Email confirmation failed. Please try again or contact support.');
          }
          
          toast.error('Email confirmation failed');
        } else {
          console.log('Email confirmed successfully:', data);
          setStatus('success');
          setMessage('Your email has been confirmed successfully! You can now sign in to your account.');
          toast.success('Email confirmed successfully!');
          
          // Redirect to auth page after a short delay
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
        }
      } catch (error) {
        console.error('Unexpected error during email confirmation:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  const handleRetrySignup = () => {
    navigate('/auth?tab=sign-up');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
            {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
            {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          
          <CardTitle>
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {status === 'success' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Redirecting you to sign in...
              </p>
              <Button onClick={handleSignIn} className="w-full">
                Sign In Now
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button onClick={handleRetrySignup} className="w-full">
                Try Signing Up Again
              </Button>
              <Button onClick={handleSignIn} variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
