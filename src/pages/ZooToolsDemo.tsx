
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import ZooToolsContactForm from '@/components/form/ZooToolsContactForm';

const ZooToolsDemo = () => {
  const handleContactSuccess = (contact: any) => {
    console.log('Contact added successfully:', contact);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">ZooTools Integration</h1>
          <p className="text-muted-foreground">
            Add contacts to your ZooTools CRM directly from your application
          </p>
        </div>
        
        <div className="flex justify-center">
          <ZooToolsContactForm onSuccess={handleContactSuccess} />
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need an API key? Get one from your{' '}
            <a 
              href="https://zootools.co/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ZooTools dashboard
            </a>
          </p>
          <p className="mt-2">
            Questions? Contact{' '}
            <a 
              href="mailto:support@zootools.co"
              className="text-primary hover:underline"
            >
              support@zootools.co
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZooToolsDemo;
