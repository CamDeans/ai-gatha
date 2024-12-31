'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/dashboard/Sidebar';

export default function ClientSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Overlay - placed first in DOM to be behind sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[49] sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Toggle button */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 left-4 z-[51] sm:hidden p-2 h-12 w-12 hover:bg-accent rounded-full shadow-md bg-background"
          onClick={() => setIsOpen(true)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}
      
      {/* Sidebar container */}
      <div 
        className={`
          fixed inset-y-0 left-0 
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:relative sm:translate-x-0
          bg-background border-r
          w-72 sm:w-64
          min-h-[100dvh] sm:min-h-[calc(100vh-3.5rem)]
          flex flex-col
          touch-pan-y
          shadow-lg sm:shadow-none
          z-[50]
        `}
      >
        <div className="flex-1 p-4">
          <Sidebar />
        </div>
      </div>
    </>
  );
} 