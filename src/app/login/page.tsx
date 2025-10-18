'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signInWithEmail, signUpWithEmail, onAuthStateChange } from '@/lib/firebaseAuth'
import { User } from 'firebase/auth'

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (currentUser) {
        router.push('/')
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    if (isSignUp) {
      const { user: signedUpUser, error: signUpError } = await signUpWithEmail(email, password, displayName)
      
      if (signUpError) {
        setError(signUpError)
        setLoading(false)
      } else if (signedUpUser) {
        // User will be redirected by the onAuthStateChange listener
        setUser(signedUpUser)
      }
    } else {
      const { user: signedInUser, error: signInError } = await signInWithEmail(email, password)
      
      if (signInError) {
        setError(signInError)
        setLoading(false)
      } else if (signedInUser) {
        // User will be redirected by the onAuthStateChange listener
        setUser(signedInUser)
      }
    }
  }

  if (loading && !email) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse-gentle mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-serenity-500 to-mindful-500 rounded-full mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-serenity-600 via-mindful-600 to-balance-600 bg-clip-text text-transparent mb-4">
            AURA
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </p>
          <p className="text-sm text-gray-500">
            {isSignUp ? 'Sign up to access your AI Balance Agent' : 'Sign in to access your AI Balance Agent'}
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* Name Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-serenity-500 focus:ring-2 focus:ring-serenity-200 transition-all outline-none"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-serenity-500 focus:ring-2 focus:ring-serenity-200 transition-all outline-none"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={isSignUp ? "Create a password (min. 6 characters)" : "Enter your password"}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-serenity-500 focus:ring-2 focus:ring-serenity-200 transition-all outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-serenity-500 to-mindful-500 hover:from-serenity-600 hover:to-mindful-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                }}
                className="text-sm text-serenity-600 hover:text-serenity-700 font-medium"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🌟 AURA helps you balance productivity with wellness
          </p>
        </div>
      </div>
    </main>
  )
}
