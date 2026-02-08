'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRoleBasedRedirect, UserRole } from '@/lib/auth'
import { AuthLayout, GoogleButton, Button, Input, Alert } from '@/components'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const supabase = createClient()

  /**
   * Handle email/password login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Provide user-friendly error messages
        if (authError.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link to verify your account.')
        } else if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.')
        }
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Login failed. Please try again.')
      }

      // Fetch user role from users table using auth_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', authData.user.id)
        .single()

      if (userError || !userData) {
        throw new Error('User profile not found. Please contact support.')
      }

      // Redirect based on role
      const redirectPath = getRoleBasedRedirect(userData.role as UserRole)
      router.push(redirectPath)
      router.refresh()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle Google OAuth login
   */
  const handleGoogleLogin = async () => {
    setError(null)
    setIsGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect with Google')
      setIsGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to UniLife"
    >
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sign In */}
      <GoogleButton
        onClick={handleGoogleLogin}
        isLoading={isGoogleLoading}
        text="Sign in with Google"
      />

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">or continue with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@university.edu"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-6"
        >
          Sign in
        </Button>
      </form>

      {/* Sign up link */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link
          href="/signup"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}
