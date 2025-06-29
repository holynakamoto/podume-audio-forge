
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '@/auth/ClerkAuthProvider';
import Logo from '@/components/Logo';
import { MobileNav } from './MobileNav';

const Header = () => {
  const { isSignedIn } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Logo />
            <span className="text-xl font-bold text-white">Podume</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/create" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Create
            </Link>
            <Link 
              to="/financial" 
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              Financial
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/create">
                  <Button className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
