'use client'

import { BalanceScore as BalanceScoreType } from '@/types'

interface ScoreBoardProps {
  score: BalanceScoreType
  totalPoints: number
  completedTasks: number
  totalTasks: number
  workTime: number
  energyLevel: number
}

export default function ScoreBoard({ 
  score, 
  totalPoints,
  completedTasks,
  totalTasks,
  workTime,
  energyLevel
}: ScoreBoardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600'
    if (value >= 60) return 'text-yellow-600'
    if (value >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-yellow-500'
    if (value >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Balance Score Card */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-bold text-emerald mb-6">
          Balance Score
        </h3>

        {/* Circular Score Display */}
        <div className="flex justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e0e0e0"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#scoreGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - score.overall / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e699" />
                  <stop offset="100%" stopColor="#00b377" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                  {score.overall}
                </div>
                <div className="text-xs text-gray-500 font-medium">/ 100</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Productivity</span>
              <span className={`text-sm font-bold ${getScoreColor(score.productivity)}`}>
                {score.productivity}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor(score.productivity)} transition-all duration-1000`}
                style={{ width: `${score.productivity}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Wellness</span>
              <span className={`text-sm font-bold ${getScoreColor(score.wellness)}`}>
                {score.wellness}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-pink-500 to-red-400 transition-all duration-1000`}
                style={{ width: `${score.wellness}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Consistency</span>
              <span className={`text-sm font-bold ${getScoreColor(score.consistency)}`}>
                {score.consistency}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-green-500 to-teal transition-all duration-1000`}
                style={{ width: `${score.consistency}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats Card */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-bold text-emerald mb-4">
          Today's Stats
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completed</span>
            <span className="font-semibold text-teal">
              {completedTasks}/{totalTasks}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Progress</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-light to-teal transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-teal min-w-[3rem] text-right">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Work Time</span>
            <span className="font-semibold text-gray-800">
              {workTime.toFixed(1)}h
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Energy Level</span>
            <span className="font-semibold text-gray-800">
              {energyLevel}/10
            </span>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Points</span>
              <span className="text-xl font-bold text-teal">
                {totalPoints}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
