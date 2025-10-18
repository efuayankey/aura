'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderBarProps {
  userName: string;
  onStartPlan: () => void;
  onMenuClick: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  userName,
  onStartPlan,
  onMenuClick,
}) => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Left section: Menu button (mobile) + Greeting */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden focus:ring-2 focus:ring-indigo-500"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shadow-md flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-4 h-4 rounded-full bg-white/90" />
            </motion.div>
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Hi, {userName} 👋
              </h1>
              <p className="text-sm text-gray-500">
                Here is how your day is shaping up
              </p>
            </div>
          </div>
        </div>

        {/* Right section: Search + Start button */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              aria-label="Search"
              className="pl-10 w-48 lg:w-64 focus:ring-indigo-500"
            />
          </div>
          
          <Button
            onClick={onStartPlan}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Start planning"
          >
            Start
          </Button>
        </div>
      </div>
    </header>
  );
};
