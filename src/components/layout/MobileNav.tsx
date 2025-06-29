
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '@/auth/ClerkAuthProvider';
import { Menu, X } from 'lucide-react';

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const closeMenu = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-gray-900 border-gray-800">
        <div className="flex flex-col space-y-6 mt-6">
          <Link 
            to="/" 
            onClick={closeMenu}
            className="text-gray-300 hover:text-white transition-colors duration-200 text-lg"
          >
            Home
          </Link>
          <Link 
            to="/create" 
            onClick={closeMenu}
            className="text-gray-300 hover:text-white transition-colors duration-200 text-lg"
          >
            Create
          </Link>
          <Link 
            to="/financial" 
            onClick={closeMenu}
            className="text-gray-300 hover:text-white transition-colors duration-200 text-lg"
          >
            Financial
          </Link>
          
          <div className="pt-6 border-t border-gray-800">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
                <span className="text-gray-300">Account</span>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/auth" onClick={closeMenu}>
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/create" onClick={closeMenu}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
