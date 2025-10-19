'use client'

import { UserInput } from '@/types'

interface FeelingSelectorProps {
  mood: UserInput['mood']
  energy: number
  onMoodChange: (mood: UserInput['mood']) => void
  onEnergyChange: (energy: number) => void
}

export default function FeelingSelector({ 
  mood, 
  energy, 
  onMoodChange, 
  onEnergyChange 
}: FeelingSelectorProps) {
  const moods = [
    { key: 'energized', label: 'Energized', emoji: '⚡' },
    { key: 'balanced', label: 'Balanced', emoji: '🍃' },
    { key: 'tired', label: 'Tired', emoji: '🌙' },
    { key: 'stressed', label: 'Stressed', emoji: '⚠️' },
  ] as const

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-emerald mb-3">
        🌱 How Are You Feeling?
      </label>
      
      {/* Mood Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {moods.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => onMoodChange(key)}
            className={`p-4 rounded-xl border-2 transition-all ${
              mood === key
                ? 'border-teal bg-teal/10 shadow-md'
                : 'border-gray-200 bg-white/50 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{emoji}</div>
            <div className={`text-sm font-medium ${
              mood === key ? 'text-emerald' : 'text-gray-700'
            }`}>
              {label}
            </div>
          </button>
        ))}
      </div>

      {/* Energy Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Energy Level
        </label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-medium">Low</span>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => onEnergyChange(parseInt(e.target.value))}
            className="flex-1 h-2"
          />
          <span className="text-sm text-gray-500 font-medium">High</span>
          <span className="text-lg font-bold text-teal min-w-[2.5rem] text-center">
            {energy}
          </span>
        </div>
      </div>
    </div>
  )
}
