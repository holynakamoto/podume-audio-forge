
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('secure-waitlist', {
        body: { 
          email: email.trim(),
          source: 'website_waitlist'
        }
      });

      if (error) {
        console.error('Waitlist submission error:', error);
        if (error.message?.includes('already registered')) {
          toast.error('This email is already on the waitlist');
        } else {
          toast.error('Failed to join waitlist. Please try again.');
        }
        return;
      }

      setIsSubscribed(true);
      toast.success('Successfully joined the waitlist!');
      setEmail('');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/20 via-transparent to-yellow-900/20">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">You're on the list!</h2>
          <p className="text-lg text-muted-foreground">
            We'll notify you as soon as we launch. Thanks for your interest!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-900/20 via-transparent to-yellow-900/20">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="flex items-center justify-center mb-6">
          <Mail className="h-12 w-12 text-purple-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Join the Waitlist
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Be the first to know when we launch new features and get early access to premium tools.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <Label htmlFor="waitlist-email" className="sr-only">Email address</Label>
              <Input
                id="waitlist-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
                maxLength={254}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !email.trim()}
              className="bg-gradient-to-r from-purple-600 to-yellow-400 hover:from-purple-500 hover:to-yellow-300 text-white font-semibold px-6 py-2 rounded-md"
            >
              {isSubmitting ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </div>
        </form>
        
        <p className="text-sm text-muted-foreground mt-4">
          No spam, unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

export default WaitlistSection;
