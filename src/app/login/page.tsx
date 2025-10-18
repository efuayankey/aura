'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signInWithGoogle, signInWithEmail, registerWithEmail, sendResetEmail, onAuthStateChange } from '@/lib/firebaseAuth'
import { User } from 'firebase/auth'

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegister, setIsRegister] = useState(false)
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
        router.push('/home')
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    
    const { user: signedInUser, error: signInError } = await signInWithGoogle()
    
    if (signInError) {
      setError(signInError)
      setLoading(false)
    } else if (signedInUser) {
      // User will be redirected by the onAuthStateChange listener
      setUser(signedInUser)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (isRegister) {
        const { user: registered, error: registerError } = await registerWithEmail(email, password, displayName)
        if (registerError) {
          setError(registerError)
        } else if (registered) {
          setUser(registered)
        }
      } else {
        const { user: signedIn, error: emailError } = await signInWithEmail(email, password)
        if (emailError) {
          setError(emailError)
        } else if (signedIn) {
          setUser(signedIn)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      setError('Enter your email to reset password')
      return
    }
    setError(null)
    setLoading(true)
    const { error: resetError } = await sendResetEmail(email)
    setLoading(false)
    if (resetError) setError(resetError)
    else alert('Password reset email sent')
  }

  if (loading) {
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
            Welcome back!
          </p>
          <p className="text-sm text-gray-500">
            Sign in with Google to access your AI Balance Agent
          </p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl p-8 shadow-xl">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                🔐 We'll request access to:
              </h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Your name and email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">•</span>
                  <span>Your Google Calendar (read-only)</span>
                </li>
              </ul>
            </div>

            {/* Email Sign In / Register */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {isRegister && (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mindful-400"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mindful-400"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/70 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mindful-400"
                required
              />
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 mr-2 bg-mindful-600 hover:bg-mindful-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isRegister ? 'Create account' : 'Sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="ml-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {isRegister ? 'Have an account? Sign in' : "New here? Create account"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                className="w-full text-sm text-serenity-700 hover:text-serenity-900"
              >
                Forgot password?
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400">or</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-md hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Privacy Notice */}
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
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
