'use client'

import { useState } from 'react'
import { ScheduleItem, BalanceScore } from '@/types'
import { Check, X, RefreshCw, Clock, Heart, Target, MessageSquare } from 'lucide-react'
import BalanceScoreComponent from './BalanceScore'

interface ScheduleApprovalProps {
  schedule: ScheduleItem[];
  balanceScore: BalanceScore;
  onApprove: () => void;
  onRegenerate: (feedback: string, preferences?: SchedulePreferences) => void;
  className?: string;
}

interface SchedulePreferences {
  longerBreaks?: boolean;
  shorterWorkBlocks?: boolean;
  moreWellnessTime?: boolean;
  differentTaskOrder?: boolean;
  specificChanges?: string;
}

export default function ScheduleApproval({
  schedule,
  balanceScore,
  onApprove,
  onRegenerate,
  className = ''
}: ScheduleApprovalProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [preferences, setPreferences] = useState<SchedulePreferences>({})

  const handleApprove = () => {
    onApprove()
  }

  const handleDecline = () => {
    setShowFeedback(true)
  }

  const handleRegenerate = () => {
    if (feedback.trim() || Object.values(preferences).some(Boolean)) {
      onRegenerate(feedback, preferences)
      setShowFeedback(false)
      setFeedback('')
      setPreferences({})
    }
  }

  const totalWorkTime = schedule
    .filter(item => item.type === 'work')
    .reduce((sum, item) => {
      const start = new Date(`2000-01-01 ${item.startTime}`)
      const end = new Date(`2000-01-01 ${item.endTime}`)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

  const totalBreakTime = schedule
    .filter(item => item.type === 'break' || item.type === 'wellness')
    .reduce((sum, item) => {
      const start = new Date(`2000-01-01 ${item.startTime}`)
      const end = new Date(`2000-01-01 ${item.endTime}`)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60)
    }, 0)

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent mb-2">
          Your AI-Generated Schedule
        </h2>
        <p className="text-gray-600">
          Review your personalized schedule and let us know if you'd like any adjustments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Schedule Preview */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Schedule Overview</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{Math.round(totalWorkTime / 60 * 10) / 10}h work</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span>{Math.round(totalBreakTime)}m breaks</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {schedule.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border-l-4 ${
                    item.type === 'work'
                      ? 'border-serenity-400 bg-serenity-50'
                      : item.type === 'wellness'
                      ? 'border-balance-400 bg-balance-50'
                      : 'border-mindful-400 bg-mindful-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {item.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balance Score */}
        <div>
          <BalanceScoreComponent score={balanceScore} />
        </div>
      </div>

      {/* Approval Actions */}
      {!showFeedback ? (
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            What do you think of this schedule?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleApprove}
              className="
                flex-1 flex items-center justify-center gap-3 px-6 py-4
                bg-gradient-to-r from-mindful-500 to-mindful-600 text-white
                rounded-xl font-medium transition-all duration-200
                hover:from-mindful-600 hover:to-mindful-700
                focus:outline-none focus:ring-2 focus:ring-mindful-500 focus:ring-offset-2
                shadow-lg hover:shadow-xl transform hover:scale-[1.02]
              "
            >
              <Check className="w-5 h-5" />
              Accept Schedule
            </button>
            
            <button
              onClick={handleDecline}
              className="
                flex-1 flex items-center justify-center gap-3 px-6 py-4
                bg-gradient-to-r from-gray-500 to-gray-600 text-white
                rounded-xl font-medium transition-all duration-200
                hover:from-gray-600 hover:to-gray-700
                focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                shadow-md hover:shadow-lg transform hover:scale-[1.02]
              "
            >
              <RefreshCw className="w-5 h-5" />
              Request Changes
            </button>
          </div>
        </div>
      ) : (
        /* Feedback Form */
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Help us improve your schedule
          </h3>
          
          {/* Quick Preferences */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick adjustments:</h4>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.longerBreaks || false}
                  onChange={(e) => setPreferences(prev => ({ ...prev, longerBreaks: e.target.checked }))}
                  className="rounded border-gray-300 text-mindful-600 focus:ring-mindful-500"
                />
                <span className="text-sm text-gray-700">Longer breaks</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.shorterWorkBlocks || false}
                  onChange={(e) => setPreferences(prev => ({ ...prev, shorterWorkBlocks: e.target.checked }))}
                  className="rounded border-gray-300 text-mindful-600 focus:ring-mindful-500"
                />
                <span className="text-sm text-gray-700">Shorter work blocks</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.moreWellnessTime || false}
                  onChange={(e) => setPreferences(prev => ({ ...prev, moreWellnessTime: e.target.checked }))}
                  className="rounded border-gray-300 text-mindful-600 focus:ring-mindful-500"
                />
                <span className="text-sm text-gray-700">More wellness time</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.differentTaskOrder || false}
                  onChange={(e) => setPreferences(prev => ({ ...prev, differentTaskOrder: e.target.checked }))}
                  className="rounded border-gray-300 text-mindful-600 focus:ring-mindful-500"
                />
                <span className="text-sm text-gray-700">Different task order</span>
              </label>
            </div>
          </div>

          {/* Custom Feedback */}
          <div className="mb-6">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
              Additional feedback (optional):
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you'd like to change about this schedule..."
              rows={4}
              className="
                w-full px-4 py-3 border border-gray-300 rounded-xl
                focus:ring-2 focus:ring-mindful-500 focus:border-transparent
                resize-none text-sm
              "
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowFeedback(false)}
              className="
                px-4 py-2 text-sm text-gray-600 hover:text-gray-800
                bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors
              "
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              disabled={!feedback.trim() && !Object.values(preferences).some(Boolean)}
              className="
                flex items-center gap-2 px-6 py-2 text-sm
                bg-gradient-to-r from-serenity-500 to-serenity-600 text-white
                rounded-lg font-medium transition-all duration-200
                hover:from-serenity-600 hover:to-serenity-700
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-serenity-500 focus:ring-offset-2
              "
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  )
}