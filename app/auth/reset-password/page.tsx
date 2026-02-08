'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthLayout, Button, Input, Alert } from '@/components'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const supabase = createClient()

  // Check if user has valid reset session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsValidSession(!!session)
      setIsChecking(false)
    }
    checkSession()
  }, [supabase.auth])

  /**
   * Handle password reset
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw new Error(error.message)
      }

      setIsSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <AuthLayout title="Reset password" subtitle="Verifying your session...">
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AuthLayout>
    )
  }

  if (!isValidSession) {
    return (
      <AuthLayout title="Invalid or expired link" subtitle="This password reset link is no longer valid">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          
          <p className="text-gray-600">
            This link may have expired or already been used. Please request a new password reset.
          </p>
          
          <div className="flex flex-col gap-3">
            <Link href="/forgot-password">
              <Button fullWidth>Request new reset link</Button>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </motion.div>
      </AuthLayout>
    )
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Password updated!" subtitle="Your password has been successfully reset">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          
          <p className="text-gray-600">
            Redirecting you to login...
          </p>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Create a strong password for your account"
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="Enter new password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={isLoading}
          helperText="Must be at least 8 characters"
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Confirm new password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-6"
        >
          Update password
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to login
      </Link>
    </AuthLayout>
  )
}
