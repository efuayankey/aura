'use client'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-mint-light via-mint-DEFAULT to-white flex items-center justify-center z-50">
      <div className="text-center max-w-md px-8">
        {/* Spinner */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-serenity-500 border-r-teal animate-spin"></div>
          </div>
        </div>

        {/* Main Text */}
        <h2 className="text-3xl font-bold text-emerald mb-6">
          AI is generating your perfect day...
        </h2>

        {/* Progress Steps */}
        <div className="space-y-3 text-left bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-3 h-3 bg-teal rounded-full"></div>
            <span className="text-sm text-gray-700 font-medium">Processing your tasks and priorities</span>
          </div>
          <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.2s' }}>
            <div className="w-3 h-3 bg-serenity-500 rounded-full"></div>
            <span className="text-sm text-gray-700 font-medium">Analyzing your mood and energy levels</span>
          </div>
          <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
            <div className="w-3 h-3 bg-balance-500 rounded-full"></div>
            <span className="text-sm text-gray-700 font-medium">Optimizing schedule for wellness balance</span>
          </div>
          <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: '0.6s' }}>
            <div className="w-3 h-3 bg-mindful-500 rounded-full"></div>
            <span className="text-sm text-gray-700 font-medium">Creating your personalized schedule</span>
          </div>
        </div>

        <p className="text-gray-500 mt-6 text-sm">
          ✨ Using AI for intelligent scheduling
        </p>
      </div>
    </div>
  )
}
