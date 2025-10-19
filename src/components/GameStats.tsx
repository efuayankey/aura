'use client'

import { GameStats as GameStatsType } from '@/types'
import { Trophy, TrendingUp, Star, Award } from 'lucide-react'
import { GamificationEngine } from '@/lib/gamificationEngine'

interface GameStatsProps {
  stats: GameStatsType;
  className?: string;
}

export default function GameStats({ stats, className = '' }: GameStatsProps) {
  const levelProgress = GamificationEngine.calculateLevelProgress(stats.totalPoints)
  const motivationalMessage = GamificationEngine.getMotivationalMessage(stats)

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    color = 'mindful' 
  }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className="glass rounded-2xl p-4 border border-white/20">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`glass rounded-3xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-mindful-500 to-mindful-600 rounded-xl">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Progress</h3>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Level {levelProgress.currentLevel}
          </span>
          <span className="text-xs text-gray-500">
            {levelProgress.pointsInLevel} / 100 XP
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-mindful-500 to-mindful-600 transition-all duration-1000 ease-out"
            style={{ width: `${levelProgress.progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          {motivationalMessage}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={Star}
          title="Total Points"
          value={stats.totalPoints}
          color="mindful"
        />
        <StatCard
          icon={TrendingUp}
          title="Current Streak"
          value={stats.currentStreak}
          subtitle={stats.longestStreak > 0 ? `Best: ${stats.longestStreak}` : undefined}
          color="serenity"
        />
      </div>

      {/* Recent Achievements */}
      {stats.achievements.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {stats.achievements.slice(-3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-mindful-50 to-serenity-50 rounded-xl border border-white/30"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-mindful-500 to-mindful-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {achievement.icon === 'target' && '🎯'}
                    {achievement.icon === 'trending-up' && '📈'}
                    {achievement.icon === 'zap' && '⚡'}
                    {achievement.icon === 'award' && '🏆'}
                    {achievement.icon === 'heart' && '❤️'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Feedback */}
      {stats.taskActions.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-balance-50 to-mindful-50 rounded-xl border border-white/30">
          <p className="text-sm text-gray-700 text-center">
            {stats.taskActions.slice(-1)[0].type === 'complete' && 
              `+${GamificationEngine['POINTS'].COMPLETE} points earned!`}
            {stats.taskActions.slice(-1)[0].type === 'skip' && 
              `${GamificationEngine['POINTS'].SKIP} points - no worries, you've got this!`}
            {stats.taskActions.slice(-1)[0].type === 'reschedule' && 
              `+${GamificationEngine['POINTS'].RESCHEDULE} points for smart planning!`}
          </p>
        </div>
      )}
    </div>
  )
}

// Minimal stats for header/sidebar
export function MiniGameStats({ stats }: { stats: GameStatsType }) {
  const levelProgress = GamificationEngine.calculateLevelProgress(stats.totalPoints)

  return (
    <div className="flex items-center gap-4 px-4 py-2 glass rounded-2xl">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-mindful-600" />
        <span className="text-sm font-semibold text-gray-700">
          Level {levelProgress.currentLevel}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-serenity-600" />
        <span className="text-sm font-medium text-gray-600">
          {stats.totalPoints} XP
        </span>
      </div>
      {stats.currentStreak > 0 && (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-balance-600" />
          <span className="text-sm font-medium text-gray-600">
            {stats.currentStreak} streak
          </span>
        </div>
      )}
    </div>
  )
}