'use client'

import { BalanceScore as BalanceScoreType } from '@/types'
import { Activity, Heart, Target, TrendingUp } from 'lucide-react'

interface BalanceScoreProps {
  score: BalanceScoreType;
  className?: string;
}

export default function BalanceScore({ score, className = '' }: BalanceScoreProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'from-mindful-500 to-mindful-600'
    if (value >= 60) return 'from-yellow-500 to-orange-500'
    if (value >= 40) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-red-600'
  }

  const getScoreMessage = (overall: number) => {
    if (overall >= 90) return "Perfect balance! You're crushing it!"
    if (overall >= 80) return "Great balance! Keep up the awesome work!"
    if (overall >= 70) return "Good balance! Small tweaks could make it even better."
    if (overall >= 60) return "Decent balance, but there's room for improvement."
    if (overall >= 40) return "Consider adjusting your schedule for better balance."
    return "Your day needs more balance - let AURA help!"
  }

  const CircularProgress = ({ value, color }: { value: number; color: string }) => {
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={`stop-color-mindful-500`} />
              <stop offset="100%" className={`stop-color-mindful-600`} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-700">{value}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`glass rounded-3xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-mindful-500 to-mindful-600 rounded-xl">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Balance Score</h3>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="relative">
            <CircularProgress value={score.overall} color={getScoreColor(score.overall)} />
          </div>
        </div>
        <div className={`text-4xl font-bold bg-gradient-to-r ${getScoreColor(score.overall)} bg-clip-text text-transparent mb-2`}>
          {score.overall}
        </div>
        <p className="text-sm text-gray-600 max-w-xs mx-auto">
          {getScoreMessage(score.overall)}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-serenity-100 rounded-lg">
              <Target className="w-4 h-4 text-serenity-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Productivity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreColor(score.productivity)} transition-all duration-1000`}
                style={{ width: `${score.productivity}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600 min-w-[2rem]">
              {score.productivity}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-balance-100 rounded-lg">
              <Heart className="w-4 h-4 text-balance-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Wellness</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreColor(score.wellness)} transition-all duration-1000`}
                style={{ width: `${score.wellness}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600 min-w-[2rem]">
              {score.wellness}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mindful-100 rounded-lg">
              <Activity className="w-4 h-4 text-mindful-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Consistency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getScoreColor(score.consistency)} transition-all duration-1000`}
                style={{ width: `${score.consistency}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-600 min-w-[2rem]">
              {score.consistency}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}