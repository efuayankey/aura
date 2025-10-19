'use client'

import { useState } from 'react'
import { Clock, X, Check } from 'lucide-react'

interface ManualRescheduleModalProps {
  isOpen: boolean
  taskTitle: string
  taskDuration: number // in minutes
  currentSchedule: any[]
  onReschedule: (newStartTime: string, newEndTime: string) => void
  onCancel: () => void
}

export default function ManualRescheduleModal({
  isOpen,
  taskTitle,
  taskDuration,
  currentSchedule,
  onReschedule,
  onCancel
}: ManualRescheduleModalProps) {
  const [selectedTime, setSelectedTime] = useState('')
  const [timeError, setTimeError] = useState('')

  if (!isOpen) return null

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`
    } else if (hours > 0) {
      return `${hours}h`
    } else {
      return `${mins}m`
    }
  }

  const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const checkTimeConflict = (startTime: string): string | null => {
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = startMinutes + taskDuration

    // Check for conflicts with existing tasks
    const workTasks = currentSchedule.filter(item => item.type === 'work')
    
    for (const task of workTasks) {
      const taskStart = timeToMinutes(task.startTime)
      const taskEnd = timeToMinutes(task.endTime)
      
      // Check for overlap
      if (
        (startMinutes >= taskStart && startMinutes < taskEnd) ||
        (endMinutes > taskStart && endMinutes <= taskEnd) ||
        (startMinutes <= taskStart && endMinutes >= taskEnd)
      ) {
        return `Conflicts with "${task.title}" (${task.startTime} - ${task.endTime})`
      }
    }

    return null
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    setTimeError('')

    if (time) {
      const conflict = checkTimeConflict(time)
      if (conflict) {
        setTimeError(conflict)
      }
    }
  }

  const handleReschedule = () => {
    if (!selectedTime) {
      setTimeError('Please select a time')
      return
    }

    const conflict = checkTimeConflict(selectedTime)
    if (conflict) {
      setTimeError(conflict)
      return
    }

    const startMinutes = timeToMinutes(selectedTime)
    const endMinutes = startMinutes + taskDuration
    const endTime = minutesToTime(endMinutes)

    onReschedule(selectedTime, endTime)
  }

  const generateTimeSlots = (): string[] => {
    const slots: string[] = []
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Round to next 15-minute interval
    let startHour = currentHour
    let startMinute = Math.ceil(currentMinute / 15) * 15
    
    if (startMinute >= 60) {
      startHour += 1
      startMinute = 0
    }

    // Generate slots from now until 11 PM
    for (let hour = startHour; hour <= 23; hour++) {
      const startMin = hour === startHour ? startMinute : 0
      
      for (let minute = startMin; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }

    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mindful-100 rounded-lg">
                <Clock className="w-5 h-5 text-mindful-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Choose New Time</h3>
                <p className="text-sm text-gray-600">Pick a time for "{taskTitle}"</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Task Duration:</span>
              <span className="font-medium">{formatDuration(taskDuration)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Start Time
            </label>
            <select
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mindful-500 focus:border-mindful-500"
            >
              <option value="">Choose a time...</option>
              {timeSlots.map((time) => {
                const endMinutes = timeToMinutes(time) + taskDuration
                const endTime = minutesToTime(endMinutes)
                const hasConflict = checkTimeConflict(time)
                
                return (
                  <option 
                    key={time} 
                    value={time}
                    disabled={hasConflict !== null}
                  >
                    {time} - {endTime} {hasConflict ? '(Conflict)' : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {timeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{timeError}</p>
            </div>
          )}

          {selectedTime && !timeError && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-700 text-sm">
                ✅ "{taskTitle}" will be scheduled from {selectedTime} to{' '}
                {minutesToTime(timeToMinutes(selectedTime) + taskDuration)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReschedule}
            disabled={!selectedTime || !!timeError}
            className="flex-1 px-4 py-2 bg-mindful-500 text-white rounded-lg hover:bg-mindful-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Reschedule
          </button>
        </div>
      </div>
    </div>
  )
}