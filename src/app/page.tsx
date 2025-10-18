'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { HeaderBar } from '@/components/HeaderBar';
import { DashboardCard } from '@/components/DashboardCard';
import { DashboardCardData } from '@/lib/aura-types';
import { Sheet, SheetContent } from '@/components/ui/sheet';

// Dummy data for dashboard cards
const dashboardCards: DashboardCardData[] = [
  {
    id: 'academic',
    title: 'Academic',
    emoji: '📘',
    subtitle: 'Courses and study blocks',
    items: [
      'CS 101 Lecture - 10:00 AM',
      'Study Session: Data Structures - 2:00 PM',
    ],
    suggestionText: 'Consider a 25-min break after your study session',
  },
  {
    id: 'personal',
    title: 'Personal',
    emoji: '🧺',
    subtitle: 'Chores and social',
    items: [
      'Laundry - 4:00 PM',
      'Coffee with Sarah - 6:00 PM',
    ],
    suggestionText: 'Great balance! Keep time for friends',
  },
  {
    id: 'health',
    title: 'Health',
    emoji: '🧘',
    subtitle: 'Sleep, meals, exercise',
    items: [
      'Morning Yoga - 7:00 AM',
      'Lunch Break - 12:30 PM',
    ],
    suggestionText: 'Try adding a short evening walk',
  },
  {
    id: 'reflection',
    title: 'Reflection',
    emoji: '✍️',
    subtitle: 'Journaling and gratitude',
    items: [
      'Morning Journal - 8:00 AM',
      'Evening Gratitude - 9:00 PM',
    ],
    suggestionText: 'Reflecting helps process your day',
  },
];

export default function HomePage() {
  const [activeNavItem, setActiveNavItem] = useState('achievement');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stub handlers
  const handleNavigate = (itemId: string) => {
    console.log(`Navigate to: ${itemId}`);
    setActiveNavItem(itemId);
    setIsMobileMenuOpen(false);
  };

  const handleStartPlan = () => {
    console.log('Start plan clicked');
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(true);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Desktop Sidebar - Fixed at 280px */}
      <div className="hidden md:block w-[280px] flex-shrink-0">
        <div className="fixed top-0 left-0 w-[280px] h-full">
          <Sidebar activeItem={activeNavItem} onNavigate={handleNavigate} />
        </div>
      </div>

      {/* Mobile Sidebar - Sheet/Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <Sidebar activeItem={activeNavItem} onNavigate={handleNavigate} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <HeaderBar
          userName="Grace"
          onStartPlan={handleStartPlan}
          onMenuClick={handleMenuClick}
        />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Dashboard Cards Grid - 2x2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardCards.map((card, index) => (
                <DashboardCard key={card.id} card={card} index={index} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
