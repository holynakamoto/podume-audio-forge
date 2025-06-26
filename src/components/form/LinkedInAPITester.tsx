
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const LinkedInAPITester: React.FC = () => {
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const testLinkedInAPIs = async () => {
    setIsTestingAPI(true);
    setTestResults(null);
    
    try {
      console.log('=== LinkedIn API Multi-Test Starting ===');
      
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
        },
        apiTests: []
      };

      console.log('Session check results:', results.session);

      if (session?.provider_token && session.user.app_metadata?.provider === 'linkedin_oidc') {
        console.log('Testing 5 different LinkedIn API endpoints...');
        
        const apiEndpoints = [
          {
            name: 'Basic Profile (lite)',
            url: 'https://api.linkedin.com/v2/people/~:(id,firstName,lastName)',
            description: 'Basic profile with minimal fields'
          },
          {
            name: 'Profile with Picture',
            url: 'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))',
            description: 'Profile including picture data'
          },
          {
            name: 'Profile with Headline',
            url: 'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,headline)',
            description: 'Profile including headline/title'
          },
          {
            name: 'Extended Profile',
            url: 'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,headline,summary,positions)',
            description: 'Profile with summary and positions'
          },
          {
            name: 'User Info (OpenID)',
            url: 'https://api.linkedin.com/v2/userinfo',
            description: 'OpenID Connect user info endpoint'
          }
        ];

        // Test each API endpoint
        for (const endpoint of apiEndpoints) {
          console.log(`Testing ${endpoint.name}...`);
          
          try {
            const response = await fetch(endpoint.url, {
              headers: {
                'Authorization': `Bearer ${session.provider_token}`,
                'Content-Type': 'application/json',
              },
            });

            const responseData = response.ok ? await response.json() : await response.text();
            
            results.apiTests.push({
              name: endpoint.name,
              url: endpoint.url,
              description: endpoint.description,
              success: response.ok,
              status: response.status,
              statusText: response.statusText,
              dataReceived: response.ok,
              dataKeys: response.ok && typeof responseData === 'object' ? Object.keys(responseData) : [],
              error: !response.ok ? responseData : null,
              responsePreview: response.ok ? JSON.stringify(responseData).substring(0, 200) + '...' : null
            });

            console.log(`${endpoint.name} result:`, {
              success: response.ok,
              status: response.status,
              dataKeys: response.ok && typeof responseData === 'object' ? Object.keys(responseData) : []
            });

          } catch (apiError: any) {
            results.apiTests.push({
              name: endpoint.name,
              url: endpoint.url,
              description: endpoint.description,
              success: false,
              error: apiError.message,
              dataReceived: false
            });
            console.error(`${endpoint.name} failed:`, apiError);
          }
        }

        // Also test our edge function
        console.log('Testing our linkedin-profile edge function...');
        try {
          const { data, error } = await supabase.functions.invoke('linkedin-profile', {
            body: { access_token: session.provider_token }
          });

          results.edgeFunction = {
            success: !error,
            error: error?.message,
            dataReceived: !!data?.data,
            dataLength: data?.data?.length || 0,
            fullResponse: data
          };

        } catch (edgeError: any) {
          results.edgeFunction = {
            success: false,
            error: edgeError.message,
            dataReceived: false
          };
        }

      } else {
        results.error = 'No LinkedIn OAuth session found - please authenticate first';
        console.log('No LinkedIn session found, user needs to authenticate');
      }

      setTestResults(results);
      
      const successfulTests = results.apiTests?.filter((test: any) => test.success).length || 0;
      const totalTests = results.apiTests?.length || 0;
      
      if (successfulTests > 0) {
        toast.success(`LinkedIn API tests completed: ${successfulTests}/${totalTests} successful!`);
      } else {
        toast.error(`All LinkedIn API tests failed`);
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
        <h3 className="font-semibold text-yellow-900 mb-3">LinkedIn Multi-API Tester</h3>
        
        <Button 
          onClick={testLinkedInAPIs}
          disabled={isTestingAPI}
          className="mb-4"
          variant="outline"
        >
          {isTestingAPI ? 'Testing 5 LinkedIn APIs...' : 'Test 5 Different LinkedIn API Calls'}
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

                {testResults.apiTests && testResults.apiTests.length > 0 && (
                  <div>
                    <strong>API Endpoint Tests:</strong>
                    <div className="ml-4 mt-1 space-y-2">
                      {testResults.apiTests.map((test: any, index: number) => (
                        <div key={index} className="border-l-2 border-gray-300 pl-3">
                          <div className="font-medium">
                            {test.name} {test.success ? '✅' : '❌'}
                          </div>
                          <div className="text-xs text-gray-600">{test.description}</div>
                          <div className="text-xs">
                            Status: {test.status} | Data Keys: {test.dataKeys?.join(', ') || 'None'}
                          </div>
                          {test.error && (
                            <div className="text-xs text-red-600">Error: {test.error}</div>
                          )}
                          {test.responsePreview && (
                            <div className="text-xs text-green-600">Data: {test.responsePreview}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {testResults.edgeFunction && (
                  <div>
                    <strong>Edge Function Test:</strong>
                    <ul className="ml-4 mt-1">
                      <li>• Success: {testResults.edgeFunction.success ? '✅' : '❌'}</li>
                      {testResults.edgeFunction.error && (
                        <li>• Error: {testResults.edgeFunction.error}</li>
                      )}
                      {testResults.edgeFunction.dataReceived && (
                        <li>• Data received: ✅ ({testResults.edgeFunction.dataLength} characters)</li>
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

            {testResults.edgeFunction?.fullResponse && (
              <details className="bg-gray-100 p-2 rounded text-xs">
                <summary className="cursor-pointer font-medium">View Edge Function Response</summary>
                <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-40">
                  {JSON.stringify(testResults.edgeFunction.fullResponse, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
