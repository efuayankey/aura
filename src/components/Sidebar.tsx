'use client';

import React from 'react';
import { Calendar, RefreshCw, Trophy, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeItem: string;
  onNavigate: (itemId: string) => void;
}

const navItems = [
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'sync', label: 'Sync Calendar', icon: RefreshCw },
  { id: 'achievement', label: 'Achievement Home', icon: Trophy },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'signout', label: 'Sign Out', icon: LogOut },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo area */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white/90 animate-pulse-gentle" />
          </div>
          <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            AURA
          </span>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4" aria-label="Main navigation">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
