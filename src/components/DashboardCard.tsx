'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardCardData } from '@/lib/aura-types';

interface DashboardCardProps {
  card: DashboardCardData;
  index: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ card, index }) => {
  const handleAddItem = () => {
    console.log(`Add item clicked for ${card.title}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow duration-200"
    >
      {/* Card header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <span>{card.emoji}</span>
          <span>{card.title}</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
      </div>

      {/* Items list */}
      <ul className="space-y-2 mb-4 flex-1" aria-label={`${card.title} items`}>
        {card.items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <span className="text-indigo-500 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* AURA suggestion chip */}
      <div className="mb-4 px-3 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg border border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex-shrink-0" />
          <p className="text-xs text-gray-700">{card.suggestionText}</p>
        </div>
      </div>

      {/* CTA button */}
      <Button
        onClick={handleAddItem}
        variant="outline"
        className="w-full justify-center gap-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-label={`Add item to ${card.title}`}
      >
        <Plus className="w-4 h-4" />
        <span>Add item</span>
      </Button>
    </motion.article>
  );
};
