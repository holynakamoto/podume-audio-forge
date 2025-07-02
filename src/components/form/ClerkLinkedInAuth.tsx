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
    console.log('[ClerkLinkedIn] === Full User Debug ===');
    console.log('[ClerkLinkedIn] User exists:', !!user);
    console.log('[ClerkLinkedIn] User object:', user);
    console.log('[ClerkLinkedIn] External accounts:', user?.externalAccounts);
    console.log('[ClerkLinkedIn] External accounts length:', user?.externalAccounts?.length);
    
    if (user?.externalAccounts) {
      user.externalAccounts.forEach((account, index) => {
        console.log(`[ClerkLinkedIn] External account ${index}:`, account);
        console.log(`[ClerkLinkedIn] Provider ${index}:`, account.provider);
      });
    }
    
    if (user?.externalAccounts && !hasProcessedData) {
      const linkedInAccount = user.externalAccounts.find(
        account => account.provider === 'linkedin_oidc'
      );
      
      console.log('[ClerkLinkedIn] LinkedIn account found:', linkedInAccount);
      
      if (linkedInAccount || user.fullName) {
        console.log('[ClerkLinkedIn] Processing user data...');
        
        // Create LinkedIn data even if no specific LinkedIn account (since user signed in via LinkedIn)
        const linkedInData = {
          name: user.fullName || `${user.firstName} ${user.lastName}`,
          email: user.primaryEmailAddress?.emailAddress,
          linkedInId: linkedInAccount?.id || 'clerk-user',
          imageUrl: user.imageUrl,
          publicMetadata: user.publicMetadata,
          fullUserData: user
        };
        
        console.log('[ClerkLinkedIn] Sending LinkedIn data:', linkedInData);
        onLinkedInData(linkedInData);
        setHasProcessedData(true);
      } else {
        console.log('[ClerkLinkedIn] No LinkedIn account or user data found');
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