'use client'

import { useState } from 'react'
import { Heart, Brain, Sparkles, Leaf, Sun, Moon, Wind } from 'lucide-react'

interface WellnessActivitySuggestionsProps {
  taskType: 'break' | 'wellness'
  duration: number // in minutes
  onActivitySelect?: (activity: string) => void
  className?: string
}

interface WellnessActivity {
  id: string
  title: string
  description: string
  icon: any
  duration: string
  benefits: string[]
  instructions: string[]
}

export default function WellnessActivitySuggestions({
  taskType,
  duration,
  onActivitySelect,
  className = ''
}: WellnessActivitySuggestionsProps) {
  const [selectedActivity, setSelectedActivity] = useState<WellnessActivity | null>(null)

  const getActivitiesForDuration = (minutes: number): WellnessActivity[] => {
    const shortActivities: WellnessActivity[] = [
      {
        id: 'deep-breathing',
        title: 'Deep Breathing',
        description: '4-7-8 breathing technique for instant calm',
        icon: Wind,
        duration: '2-5 min',
        benefits: ['Reduces stress', 'Lowers heart rate', 'Improves focus'],
        instructions: [
          'Sit comfortably with your back straight',
          'Inhale through your nose for 4 counts',
          'Hold your breath for 7 counts',
          'Exhale through your mouth for 8 counts',
          'Repeat 4-6 cycles'
        ]
      },
      {
        id: 'desk-stretches',
        title: 'Desk Stretches',
        description: 'Quick stretches to release tension',
        icon: Heart,
        duration: '3-5 min',
        benefits: ['Relieves muscle tension', 'Improves circulation', 'Reduces stiffness'],
        instructions: [
          'Neck rolls: 5 each direction',
          'Shoulder shrugs: 10 times',
          'Wrist circles: 10 each direction',
          'Seated spinal twist: Hold 15 seconds each side',
          'Ankle rotations: 10 each direction'
        ]
      },
      {
        id: 'mindful-moment',
        title: 'Mindful Moment',
        description: 'Quick mindfulness practice',
        icon: Brain,
        duration: '2-5 min',
        benefits: ['Increases awareness', 'Reduces anxiety', 'Improves clarity'],
        instructions: [
          'Close your eyes or soften your gaze',
          'Notice 3 things you can hear',
          'Notice 3 things you can feel (chair, air, clothes)',
          'Take 3 deep breaths',
          'Set an intention for your next task'
        ]
      }
    ]

    const mediumActivities: WellnessActivity[] = [
      {
        id: 'walking-meditation',
        title: 'Walking Meditation',
        description: 'Mindful movement to refresh your mind',
        icon: Leaf,
        duration: '10-15 min',
        benefits: ['Boosts energy', 'Improves mood', 'Enhances creativity'],
        instructions: [
          'Walk slowly and deliberately',
          'Focus on each step and foot sensation',
          'Notice your surroundings without judgment',
          'Breathe naturally and rhythmically',
          'If indoors, walk around your space mindfully'
        ]
      },
      {
        id: 'progressive-relaxation',
        title: 'Progressive Muscle Relaxation',
        description: 'Release tension from head to toe',
        icon: Moon,
        duration: '10-15 min',
        benefits: ['Deep relaxation', 'Reduces physical tension', 'Improves sleep quality'],
        instructions: [
          'Lie down or sit comfortably',
          'Tense and release each muscle group',
          'Start with your toes, work up to your head',
          'Hold tension for 5 seconds, then release',
          'Notice the contrast between tension and relaxation'
        ]
      },
      {
        id: 'gratitude-reflection',
        title: 'Gratitude & Reflection',
        description: 'Boost positivity and perspective',
        icon: Sun,
        duration: '5-10 min',
        benefits: ['Improves mood', 'Reduces stress', 'Increases life satisfaction'],
        instructions: [
          'Write down 3 things you\'re grateful for',
          'Reflect on one positive moment from today',
          'Think about someone who made you smile',
          'Set a positive intention for the rest of your day',
          'Take a moment to appreciate your progress'
        ]
      }
    ]

    const longActivities: WellnessActivity[] = [
      {
        id: 'full-body-stretch',
        title: 'Full Body Stretch Session',
        description: 'Complete stretching routine for whole body',
        icon: Heart,
        duration: '15-20 min',
        benefits: ['Improves flexibility', 'Reduces pain', 'Increases energy'],
        instructions: [
          'Warm up with gentle movements',
          'Stretch each major muscle group',
          'Hold each stretch for 20-30 seconds',
          'Focus on breathing deeply',
          'End with a few minutes of relaxation'
        ]
      },
      {
        id: 'meditation-session',
        title: 'Guided Meditation',
        description: 'Deep meditation for mental clarity',
        icon: Brain,
        duration: '15-20 min',
        benefits: ['Deep mental reset', 'Improved focus', 'Emotional balance'],
        instructions: [
          'Find a quiet, comfortable space',
          'Use a meditation app or guided audio',
          'Focus on your breath or a mantra',
          'When mind wanders, gently return focus',
          'End with gratitude and intention setting'
        ]
      }
    ]

    if (minutes <= 5) return shortActivities
    if (minutes <= 15) return [...shortActivities, ...mediumActivities]
    return [...shortActivities, ...mediumActivities, ...longActivities]
  }

  const activities = getActivitiesForDuration(duration)

  const handleActivityClick = async (activity: WellnessActivity) => {
    setSelectedActivity(activity)
    onActivitySelect?.(activity.title)
    
    // Get AI-powered wellness guidance from Bedrock
    try {
      console.log('🧘 Getting AI wellness guidance from Bedrock...')
      const response = await fetch('/api/bedrock/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stressLevel: 5, // Could be dynamic
          energyLevel: 7, // Could be dynamic  
          duration: duration,
          currentTime: new Date().toLocaleTimeString(),
          recentActivities: [activity.title]
        })
      })
      
      if (response.ok) {
        const aiRecommendation = await response.json()
        console.log('✅ Bedrock wellness guidance:', aiRecommendation)
        
        // Could enhance the activity with AI suggestions
        // For now, just log the enhanced guidance
      }
    } catch (error) {
      console.error('Bedrock wellness guidance failed:', error)
    }
  }

  if (selectedActivity) {
    return (
      <div className={`bg-gradient-to-br from-serenity-50 to-mindful-50 rounded-xl p-6 ${className}`}>
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <selectedActivity.icon className="w-6 h-6 text-serenity-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800">{selectedActivity.title}</h3>
            <p className="text-gray-600 text-sm">{selectedActivity.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-serenity-100 text-serenity-700 px-2 py-1 rounded-full">
                {selectedActivity.duration}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedActivity(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Benefits:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedActivity.benefits.map((benefit, index) => (
                <span
                  key={index}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
            <ol className="space-y-2">
              {selectedActivity.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 bg-serenity-100 text-serenity-700 rounded-full text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Take your time and listen to your body. Wellness is a journey, not a destination.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-serenity-50 to-mindful-50 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Sparkles className="w-5 h-5 text-serenity-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {taskType === 'wellness' ? 'Wellness Activities' : 'Break Activities'}
          </h3>
          <p className="text-sm text-gray-600">
            Choose an activity for your {duration}-minute {taskType === 'wellness' ? 'wellness break' : 'break'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => handleActivityClick(activity)}
            className="
              flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm
              hover:shadow-md transition-all duration-200 text-left
              border border-transparent hover:border-serenity-200
            "
          >
            <div className="flex-shrink-0 p-2 bg-serenity-100 rounded-lg">
              <activity.icon className="w-4 h-4 text-serenity-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-800 text-sm">{activity.title}</div>
              <div className="text-xs text-gray-600 mt-1">{activity.description}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {activity.duration}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-white/50 rounded-lg border border-serenity-200">
        <p className="text-xs text-gray-600 text-center">
          💫 Regular wellness breaks improve focus, creativity, and overall well-being
        </p>
      </div>
    </div>
  )
}