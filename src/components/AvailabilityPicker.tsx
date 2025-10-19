'use client'

interface AvailabilityPickerProps {
  startTime: string
  endTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
}

export default function AvailabilityPicker({ 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange 
}: AvailabilityPickerProps) {
  const calculateAvailableTime = () => {
    const start = new Date(`2000-01-01 ${startTime}:00`)
    const end = new Date(`2000-01-01 ${endTime}:00`)
    const hours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60))
    return hours.toFixed(1)
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-emerald mb-3">
        ⏰ When Are You Available?
      </label>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-xs text-gray-600 mb-2 font-medium">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-teal focus:border-teal transition-all bg-white text-gray-900 outline-none font-medium"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-2 font-medium">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-teal focus:border-teal transition-all bg-white text-gray-900 outline-none font-medium"
          />
        </div>
      </div>
      
      <div className="glass rounded-lg px-4 py-2">
        <p className="text-sm font-semibold text-emerald">
          Available time: <span className="text-teal">{calculateAvailableTime()} hours</span>
        </p>
      </div>
    </div>
  )
}
