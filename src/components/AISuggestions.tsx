'use client'

import { AIsuggestion } from '@/types'
import { Brain, Lightbulb, Heart, Target, X } from 'lucide-react'
import { useState } from 'react'

interface AISuggestionsProps {
  suggestions: AIsuggestion[];
  onDismiss: (suggestionId: string) => void;
  onAcceptAction?: (suggestion: AIsuggestion) => void;
  className?: string;
}

export default function AISuggestions({ 
  suggestions, 
  onDismiss, 
  onAcceptAction,
  className = '' 
}: AISuggestionsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const activeSuggestions = suggestions.filter(s => !dismissedIds.has(s.id))

  const handleDismiss = (suggestionId: string) => {
    setDismissedIds(prev => new Set([...prev, suggestionId]))
    onDismiss(suggestionId)
  }

  const getIcon = (type: AIsuggestion['type']) => {
    switch (type) {
      case 'motivation':
        return Target
      case 'adjustment':
        return Lightbulb
      case 'wellness':
        return Heart
      case 'productivity':
        return Brain
      default:
        return Brain
    }
  }

  const getColorClasses = (type: AIsuggestion['type']) => {
    switch (type) {
      case 'motivation':
        return {
          bg: 'from-mindful-50 to-mindful-100',
          border: 'border-mindful-200',
          icon: 'from-mindful-500 to-mindful-600',
          text: 'text-mindful-800'
        }
      case 'adjustment':
        return {
          bg: 'from-serenity-50 to-serenity-100',
          border: 'border-serenity-200',
          icon: 'from-serenity-500 to-serenity-600',
          text: 'text-serenity-800'
        }
      case 'wellness':
        return {
          bg: 'from-balance-50 to-balance-100',
          border: 'border-balance-200',
          icon: 'from-balance-500 to-balance-600',
          text: 'text-balance-800'
        }
      case 'productivity':
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          icon: 'from-gray-500 to-gray-600',
          text: 'text-gray-800'
        }
      default:
        return {
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          icon: 'from-gray-500 to-gray-600',
          text: 'text-gray-800'
        }
    }
  }

  if (activeSuggestions.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-r from-mindful-500 to-mindful-600 rounded-lg">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
      </div>

      {activeSuggestions.map((suggestion) => {
        const Icon = getIcon(suggestion.type)
        const colors = getColorClasses(suggestion.type)

        return (
          <div
            key={suggestion.id}
            className={`
              glass rounded-2xl p-4 border ${colors.border}
              bg-gradient-to-r ${colors.bg}
              transform transition-all duration-300
              hover:scale-[1.02] hover:shadow-lg
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 bg-gradient-to-r ${colors.icon} rounded-lg flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${colors.text} leading-relaxed`}>
                  {suggestion.message}
                </p>
                
                {suggestion.actionSuggestion && onAcceptAction && (
                  <button
                    onClick={() => onAcceptAction(suggestion)}
                    className={`
                      mt-3 px-4 py-2 bg-gradient-to-r ${colors.icon} text-white
                      rounded-lg text-xs font-medium
                      hover:opacity-90 transition-opacity
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                    `}
                  >
                    Apply Suggestion
                  </button>
                )}
              </div>
              
              <button
                onClick={() => handleDismiss(suggestion.id)}
                className="
                  p-1 text-gray-400 hover:text-gray-600 
                  rounded-lg hover:bg-white/50 
                  transition-colors flex-shrink-0
                  focus:outline-none focus:ring-2 focus:ring-gray-300
                "
                title="Dismiss suggestion"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Compact notification-style suggestions
export function NotificationSuggestion({ 
  suggestion, 
  onDismiss 
}: { 
  suggestion: AIsuggestion;
  onDismiss: () => void;
}) {
  const Icon = suggestion.type === 'motivation' ? Target :
              suggestion.type === 'wellness' ? Heart :
              suggestion.type === 'adjustment' ? Lightbulb : Brain

  return (
    <div className="
      fixed top-4 right-4 z-50 max-w-sm
      glass rounded-2xl p-4 border border-white/20
      bg-gradient-to-r from-mindful-50 to-serenity-50
      transform transition-all duration-500
      animate-in slide-in-from-right-full
    ">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-gradient-to-r from-mindful-500 to-mindful-600 rounded-lg">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-relaxed">
            {suggestion.message}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="
            p-1 text-gray-400 hover:text-gray-600 
            rounded-lg hover:bg-white/50 transition-colors
          "
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}