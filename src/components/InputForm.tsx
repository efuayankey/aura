'use client'

import { useState } from 'react'
import { Task, UserInput } from '@/types'
import { Plus, X, Zap, Leaf, Moon, AlertCircle, Sparkles } from 'lucide-react'

interface InputFormProps {
  onSubmit: (input: UserInput) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskInput, setTaskInput] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [mood, setMood] = useState<UserInput['mood']>('balanced')
  const [energy, setEnergy] = useState(7)

  const addTask = () => {
    if (taskInput.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: taskInput.trim(),
        priority: 'medium',
        estimatedTime: 60,
        completed: false
      }
      setTasks([...tasks, newTask])
      setTaskInput('')
    }
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const updateTaskPriority = (id: string, priority: Task['priority']) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, priority } : task
    ))
  }

  const updateTaskTime = (id: string, estimatedTime: number) => {
    const validTime = isNaN(estimatedTime) ? 60 : Math.max(15, estimatedTime)
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, estimatedTime: validTime } : task
    ))
  }

  const handleSubmit = () => {
    console.log('Submit button clicked, tasks:', tasks.length)
    if (tasks.length > 0) {
      console.log('Submitting with data:', { tasks, startTime, endTime, mood, energy })
      onSubmit({
        tasks,
        startTime,
        endTime,
        mood,
        energy
      })
    } else {
      console.log('No tasks added yet')
    }
  }

  const moodIcons = {
    energized: () => <Zap className="w-6 h-6" />,
    balanced: () => <Leaf className="w-6 h-6" />,
    tired: () => <Moon className="w-6 h-6" />,
    stressed: () => <AlertCircle className="w-6 h-6" />
  }

  const moodColors = {
    energized: 'from-yellow-400 to-orange-500',
    balanced: 'from-mindful-400 to-mindful-600',
    tired: 'from-blue-400 to-purple-500',
    stressed: 'from-red-400 to-pink-500'
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="glass rounded-3xl p-8 animate-slide-up">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-serenity-600 to-mindful-600 bg-clip-text text-transparent">
          What's on your mind today?
        </h2>

        {/* Task Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-800 mb-3">
            Your tasks
          </label>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="e.g., Study for calc exam, finish coding project..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-mindful-400 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500"
            />
            <button
              onClick={addTask}
              className="px-6 py-3 bg-gradient-to-r from-mindful-500 to-mindful-600 text-white rounded-xl hover:from-mindful-600 hover:to-mindful-700 transition-all font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{task.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <select
                      value={task.priority}
                      onChange={(e) => updateTaskPriority(task.id, e.target.value as Task['priority'])}
                      className="text-sm px-3 py-1 rounded-lg border border-gray-200 focus:ring-2 focus:ring-mindful-400 bg-white text-gray-900"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Time:</span>
                      <input
                        type="number"
                        value={task.estimatedTime || 60}
                        onChange={(e) => updateTaskTime(task.id, parseInt(e.target.value) || 60)}
                        min="15"
                        step="15"
                        className="w-20 text-sm px-2 py-1 rounded-lg border border-gray-200 focus:ring-2 focus:ring-mindful-400 bg-white text-gray-900"
                      />
                      <span className="text-sm text-gray-500">min</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-red-400 hover:text-red-600 ml-4 p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-800 mb-3">
            When are you available?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-mindful-400 focus:border-transparent transition-all bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-mindful-400 focus:border-transparent transition-all bg-white text-gray-900"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {(() => {
              const start = new Date(`2000-01-01 ${startTime}:00`)
              const end = new Date(`2000-01-01 ${endTime}:00`)
              const hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60))
              return `Available time: ${hours.toFixed(1)} hours`
            })()}
          </p>
        </div>

        {/* Mood Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-800 mb-3">
            How are you feeling?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(moodIcons).map(([moodKey, IconComponent]) => (
              <button
                key={moodKey}
                onClick={() => setMood(moodKey as UserInput['mood'])}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mood === moodKey
                    ? 'border-mindful-400 bg-mindful-50'
                    : 'border-gray-200 bg-white/30'
                }`}
              >
                <div className={`flex justify-center mb-3 ${
                  mood === moodKey ? 'text-mindful-600' : 'text-gray-700'
                }`}>
                  <IconComponent />
                </div>
                <div className={`text-sm font-medium capitalize ${
                  mood === moodKey ? 'text-mindful-700' : 'text-gray-800'
                }`}>{moodKey}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Level */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-800 mb-3">
            Energy level (1-10)
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Low</span>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500">High</span>
            <span className={`text-lg font-semibold min-w-[2rem] bg-gradient-to-r ${moodColors[mood]} bg-clip-text text-transparent`}>
              {energy}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={tasks.length === 0}
          className="w-full py-4 bg-gradient-to-r from-serenity-500 via-mindful-500 to-balance-500 text-white rounded-xl font-semibold text-lg hover:from-serenity-600 hover:via-mindful-600 hover:to-balance-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          Generate My Perfect Day
        </button>
      </div>
    </div>
  )
}