
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const LinkedInAPITester: React.FC = () => {
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const testLinkedInAPI = async () => {
    setIsTestingAPI(true);
    setTestResults(null);
    
    try {
      console.log('=== LinkedIn API Test Starting ===');
      
      // First, get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      const results: any = {
        timestamp: new Date().toISOString(),
        session: {
          exists: !!session,
          provider: session?.user?.app_metadata?.provider,
          hasProviderToken: !!session?.provider_token,
          providerTokenLength: session?.provider_token?.length || 0,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        }
      };

      console.log('Session check results:', results.session);

      if (session?.provider_token && session.user.app_metadata?.provider === 'linkedin_oidc') {
        console.log('Testing LinkedIn profile API with provider token...');
        
        try {
          const { data, error } = await supabase.functions.invoke('linkedin-profile', {
            body: { access_token: session.provider_token }
          });

          results.linkedinAPI = {
            success: !error,
            error: error?.message,
            dataReceived: !!data?.data,
            dataLength: data?.data?.length || 0,
            fullResponse: data
          };

          console.log('LinkedIn API test results:', results.linkedinAPI);
          
          if (data?.data) {
            console.log('Profile data preview:', data.data.substring(0, 200) + '...');
          }
        } catch (apiError: any) {
          results.linkedinAPI = {
            success: false,
            error: apiError.message,
            dataReceived: false
          };
          console.error('LinkedIn API call failed:', apiError);
        }
      } else {
        results.linkedinAPI = {
          success: false,
          error: 'No LinkedIn OAuth session found',
          needsAuth: true
        };
        console.log('No LinkedIn session found, user needs to authenticate');
      }

      setTestResults(results);
      
      if (results.linkedinAPI?.success) {
        toast.success('LinkedIn API test successful!');
      } else {
        toast.error(`LinkedIn API test failed: ${results.linkedinAPI?.error || 'Unknown error'}`);
      }

    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResults({
        timestamp: new Date().toISOString(),
        error: error.message,
        success: false
      });
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsTestingAPI(false);
    }
  };

  return (
    <Card className="mb-6 bg-yellow-50 border-yellow-200">
      <CardContent className="p-4">
        <h3 className="font-semibold text-yellow-900 mb-3">LinkedIn API Tester</h3>
        
        <Button 
          onClick={testLinkedInAPI}
          disabled={isTestingAPI}
          className="mb-4"
          variant="outline"
        >
          {isTestingAPI ? 'Testing LinkedIn API...' : 'Test LinkedIn API Connection'}
        </Button>

        {testResults && (
          <div className="space-y-3">
            <div className="bg-white p-3 rounded border text-sm">
              <h4 className="font-medium mb-2">Test Results ({testResults.timestamp})</h4>
              
              <div className="space-y-2">
                <div>
                  <strong>Session Info:</strong>
                  <ul className="ml-4 mt-1">
                    <li>• Session exists: {testResults.session?.exists ? '✅' : '❌'}</li>
                    <li>• Provider: {testResults.session?.provider || 'None'}</li>
                    <li>• Has provider token: {testResults.session?.hasProviderToken ? '✅' : '❌'}</li>
                    <li>• Token length: {testResults.session?.providerTokenLength || 0}</li>
                    <li>• User ID: {testResults.session?.userId || 'None'}</li>
                  </ul>
                </div>

                {testResults.linkedinAPI && (
                  <div>
                    <strong>LinkedIn API Test:</strong>
                    <ul className="ml-4 mt-1">
                      <li>• Success: {testResults.linkedinAPI.success ? '✅' : '❌'}</li>
                      {testResults.linkedinAPI.error && (
                        <li>• Error: {testResults.linkedinAPI.error}</li>
                      )}
                      {testResults.linkedinAPI.dataReceived && (
                        <li>• Data received: ✅ ({testResults.linkedinAPI.dataLength} characters)</li>
                      )}
                      {testResults.linkedinAPI.needsAuth && (
                        <li>• Action needed: Please authenticate with LinkedIn first</li>
                      )}
                    </ul>
                  </div>
                )}

                {testResults.error && (
                  <div>
                    <strong>General Error:</strong> {testResults.error}
                  </div>
                )}
              </div>
            </div>

            {testResults.linkedinAPI?.fullResponse && (
              <details className="bg-gray-100 p-2 rounded text-xs">
                <summary className="cursor-pointer font-medium">View Full API Response</summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(testResults.linkedinAPI.fullResponse, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
