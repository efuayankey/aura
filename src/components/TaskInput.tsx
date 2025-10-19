'use client'

import { useState } from 'react'
import { Task } from '@/types'
import { Plus, X } from 'lucide-react'

interface TaskInputProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
}

export default function TaskInput({ tasks, onTasksChange }: TaskInputProps) {
  const [taskInput, setTaskInput] = useState('')

  const addTask = () => {
    if (taskInput.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: taskInput.trim(),
        priority: 'medium',
        estimatedTime: 60,
        completed: false
      }
      onTasksChange([...tasks, newTask])
      setTaskInput('')
    }
  }

  const removeTask = (id: string) => {
    onTasksChange(tasks.filter(task => task.id !== id))
  }

  const updateTaskPriority = (id: string, priority: Task['priority']) => {
    onTasksChange(tasks.map(task => 
      task.id === id ? { ...task, priority } : task
    ))
  }

  const updateTaskTime = (id: string, estimatedTime: number) => {
    const validTime = isNaN(estimatedTime) ? 60 : Math.max(15, estimatedTime)
    onTasksChange(tasks.map(task => 
      task.id === id ? { ...task, estimatedTime: validTime } : task
    ))
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-emerald mb-3">
        📋 Your Tasks
      </label>
      
      {/* Task Input */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="e.g., Study for calc exam, finish coding project..."
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-teal focus:border-teal transition-all bg-white text-gray-900 placeholder-gray-400 outline-none"
        />
        <button
          onClick={addTask}
          className="px-6 py-3 bg-teal text-white rounded-xl hover:bg-gradient-to-r hover:from-teal-light hover:to-teal transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="glass rounded-xl p-4 flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-2">{task.name}</h4>
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Priority</label>
                  <select
                    value={task.priority}
                    onChange={(e) => updateTaskPriority(task.id, e.target.value as Task['priority'])}
                    className="text-sm px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-teal focus:border-teal bg-white text-gray-900 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Time (minutes)</label>
                  <input
                    type="number"
                    value={task.estimatedTime || 60}
                    onChange={(e) => updateTaskTime(task.id, parseInt(e.target.value) || 60)}
                    min="15"
                    step="15"
                    className="w-24 text-sm px-3 py-1.5 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-teal focus:border-teal bg-white text-gray-900 outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => removeTask(task.id)}
              className="text-red-400 hover:text-red-600 ml-4 p-2 hover:bg-red-50 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No tasks added yet. Add your first task above!
        </div>
      )}
    </div>
  )
}
