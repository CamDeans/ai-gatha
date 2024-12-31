'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/dashboard/Sidebar';

export default function ClientSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed sm:relative z-50">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-16 left-4 z-50 sm:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className={`
        fixed inset-y-0 left-0 transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:relative sm:translate-x-0
        transition duration-200 ease-in-out
        bg-background border-r
        w-64 pt-14
        sm:block
      `}>
        <Sidebar />
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 