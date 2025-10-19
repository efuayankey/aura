'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCircle, Brain, Heart, Target, Lightbulb } from 'lucide-react'
import { AIsuggestion } from '@/types'

interface NotificationCenterProps {
  suggestions: AIsuggestion[]
  onDismiss: (suggestionId: string) => void
  onAcceptAction?: (suggestion: AIsuggestion) => void
  className?: string
}

export default function NotificationCenter({
  suggestions,
  onDismiss,
  onAcceptAction,
  className = ''
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Update unread count when suggestions change
  useEffect(() => {
    const unreadSuggestions = suggestions.filter(s => !readNotifications.has(s.id))
    setUnreadCount(unreadSuggestions.length)
  }, [suggestions, readNotifications])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Mark all notifications as read when opening
      const allIds = new Set(suggestions.map(s => s.id))
      setReadNotifications(allIds)
    }
  }

  const handleDismiss = (suggestionId: string) => {
    onDismiss(suggestionId)
    setReadNotifications(prev => new Set([...prev, suggestionId]))
  }

  const handleAcceptAction = (suggestion: AIsuggestion) => {
    if (onAcceptAction) {
      onAcceptAction(suggestion)
    }
    handleDismiss(suggestion.id)
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

  const getTypeColor = (type: AIsuggestion['type']) => {
    switch (type) {
      case 'motivation':
        return 'text-mindful-600 bg-mindful-50'
      case 'adjustment':
        return 'text-serenity-600 bg-serenity-50'
      case 'wellness':
        return 'text-balance-600 bg-balance-50'
      case 'productivity':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeLabel = (type: AIsuggestion['type']) => {
    switch (type) {
      case 'motivation':
        return 'Motivation'
      case 'adjustment':
        return 'Adjustment'
      case 'wellness':
        return 'Wellness'
      case 'productivity':
        return 'Productivity'
      default:
        return 'AI Insight'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`
          relative p-3 rounded-xl transition-all duration-200
          ${isOpen 
            ? 'bg-mindful-100 text-mindful-700' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
          }
          focus:outline-none focus:ring-2 focus:ring-mindful-500 focus:ring-offset-2
        `}
        title={`${unreadCount} new notifications`}
      >
        <Bell className="w-5 h-5" />
        
        {/* Red Badge */}
        {unreadCount > 0 && (
          <span className="
            absolute -top-1 -right-1 w-5 h-5 
            bg-red-500 text-white text-xs font-bold 
            rounded-full flex items-center justify-center
            animate-pulse
          ">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="
            absolute right-0 top-full mt-2 w-96 max-w-[90vw]
            glass rounded-2xl border border-white/20 shadow-xl
            max-h-[70vh] overflow-hidden z-50
            animate-in slide-in-from-top-2 duration-200
          "
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                AI Notifications
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {suggestions.length} total
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs mt-1">AURA will share insights as you work</p>
              </div>
            ) : (
              <div className="p-2">
                {suggestions.map((suggestion) => {
                  const Icon = getIcon(suggestion.type)
                  const isUnread = !readNotifications.has(suggestion.id)
                  
                  return (
                    <div
                      key={suggestion.id}
                      className={`
                        p-3 mb-2 rounded-xl border transition-all duration-200
                        ${isUnread 
                          ? 'bg-white/80 border-mindful-200 shadow-sm' 
                          : 'bg-gray-50/50 border-gray-100'
                        }
                        hover:shadow-md hover:scale-[1.01]
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`
                              text-xs font-medium px-2 py-1 rounded-full
                              ${getTypeColor(suggestion.type)}
                            `}>
                              {getTypeLabel(suggestion.type)}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {suggestion.message}
                          </p>
                          
                          <div className="flex items-center gap-2">
                            {suggestion.actionSuggestion && onAcceptAction && (
                              <button
                                onClick={() => handleAcceptAction(suggestion)}
                                className="
                                  text-xs px-3 py-1 bg-mindful-500 text-white 
                                  rounded-lg hover:bg-mindful-600 transition-colors
                                  flex items-center gap-1
                                "
                              >
                                <Check className="w-3 h-3" />
                                Apply
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDismiss(suggestion.id)}
                              className="
                                text-xs px-3 py-1 bg-gray-200 text-gray-600 
                                rounded-lg hover:bg-gray-300 transition-colors
                                flex items-center gap-1
                              "
                            >
                              <X className="w-3 h-3" />
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {suggestions.length > 0 && (
            <div className="p-3 border-t border-white/10 bg-gray-50/50">
              <button
                onClick={() => {
                  suggestions.forEach(s => onDismiss(s.id))
                  setIsOpen(false)
                }}
                className="
                  w-full text-sm text-gray-600 hover:text-gray-800 
                  py-2 rounded-lg hover:bg-white/50 transition-colors
                  flex items-center justify-center gap-2
                "
              >
                <CheckCircle className="w-4 h-4" />
                Clear All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}