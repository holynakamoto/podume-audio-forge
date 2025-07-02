import React from 'react';
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { LinkedinIcon } from 'lucide-react';

interface ClerkLinkedInAuthProps {
  onLinkedInData: (data: any) => void;
}

export const ClerkLinkedInAuth: React.FC<ClerkLinkedInAuthProps> = ({ onLinkedInData }) => {
  const { user } = useUser();
  const [hasProcessedData, setHasProcessedData] = React.useState(false);

  React.useEffect(() => {
    if (user?.externalAccounts && !hasProcessedData) {
      const linkedInAccount = user.externalAccounts.find(
        account => account.provider === 'linkedin_oidc'
      );
      
      if (linkedInAccount && user.publicMetadata) {
        console.log('[ClerkLinkedIn] LinkedIn account found:', linkedInAccount);
        console.log('[ClerkLinkedIn] User data:', user);
        
        // Format user data for the podcast generation
        const linkedInData = {
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          email: user.primaryEmailAddress?.emailAddress,
          linkedInId: linkedInAccount.id,
          imageUrl: user.imageUrl,
          publicMetadata: user.publicMetadata
        };
        
        onLinkedInData(linkedInData);
        setHasProcessedData(true);
      }
    }
  }, [user, onLinkedInData, hasProcessedData]);

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-900 mb-2">Connect with LinkedIn</h3>
      <p className="text-blue-700 text-sm mb-3">
        Sign in with LinkedIn to automatically import your profile data
      </p>
      
      <SignedOut>
        <SignInButton 
          mode="modal"
          fallbackRedirectUrl="/create"
          forceRedirectUrl="/create"
        >
          <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <LinkedinIcon className="w-4 h-4 mr-2 fill-current" />
            Sign in with LinkedIn
          </Button>
        </SignInButton>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserButton afterSignOutUrl="/" />
            <div>
              <p className="text-green-800 text-sm font-medium">
                ✅ Signed in as {user?.fullName}
              </p>
              <p className="text-green-600 text-xs">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  );
};