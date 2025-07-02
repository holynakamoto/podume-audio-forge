
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

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
            <div className="space-y-3">
              <Link to="/create" onClick={closeMenu}>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
