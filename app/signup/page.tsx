'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRoleBasedRedirect, UserRole } from '@/lib/auth'
import { AuthLayout, GoogleButton, Button, Input, Select, Alert } from '@/components'

// Available roles for signup
const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'vendor', label: 'Food Vendor' },
  { value: 'delivery', label: 'Delivery Rider' },
]

// Sample universities (can be fetched from database)
const universityOptions = [
  { value: '', label: 'Select university (optional)' },
  { value: 'unilag', label: 'University of Lagos' },
  { value: 'ui', label: 'University of Ibadan' },
  { value: 'abu', label: 'Ahmadu Bello University' },
  { value: 'unn', label: 'University of Nigeria, Nsukka' },
  { value: 'oau', label: 'Obafemi Awolowo University' },
  { value: 'futa', label: 'Federal University of Technology, Akure' },
  { value: 'covenant', label: 'Covenant University' },
  { value: 'other', label: 'Other' },
]

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    university: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.fullName,
            role: formData.role,
          },
        },
      })

      if (authError) {
        // Provide user-friendly error messages
        if (authError.message.includes('rate limit') || authError.status === 429) {
          throw new Error('Too many signup attempts. Please wait a few minutes and try again.')
        } else if (authError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please login instead.')
        }
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create account. Please try again.')
      }

      // Insert user profile into users table
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          auth_id: authData.user.id,
          email: formData.email,
          name: formData.fullName,
          role: formData.role,
          uni_id: formData.university ? parseInt(formData.university) : null,
        })

      if (profileError) {
        // Cleanup: delete auth user if profile creation fails
        console.error('Profile creation failed:', profileError)
        throw new Error('Failed to create user profile. Please try again.')
      }

      // Show success message
      setSuccess(true)

      // If email confirmation is disabled, redirect immediately
      if (authData.session) {
        setTimeout(() => {
          const redirectPath = getRoleBasedRedirect(formData.role as UserRole)
          router.push(redirectPath)
          router.refresh()
        }, 1500)
      }

    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle Google OAuth signup
   */
  const handleGoogleSignup = async () => {
    setGeneralError(null)
    setIsGoogleLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?signup=true`,
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
      setGeneralError(err instanceof Error ? err.message : 'Failed to connect with Google')
      setIsGoogleLoading(false)
    }
  }

  /**
   * Update form field
   */
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a confirmation link">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-8 h-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </div>
          <p className="text-gray-600">
            Please check your email at <strong>{formData.email}</strong> and click the confirmation
            link to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Back to login
          </Link>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join UniLife and simplify your campus life"
    >
      <AnimatePresence mode="wait">
        {generalError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Alert type="error" message={generalError} onClose={() => setGeneralError(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sign Up */}
      <GoogleButton
        onClick={handleGoogleSignup}
        isLoading={isGoogleLoading}
        text="Sign up with Google"
      />

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">or register with email</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Student"
          icon={User}
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          error={errors.fullName}
          disabled={isLoading}
          autoComplete="name"
        />

        <Input
          label="Email address"
          type="email"
          placeholder="you@university.edu"
          icon={Mail}
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            icon={Lock}
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            error={errors.password}
            disabled={isLoading}
            autoComplete="new-password"
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Confirm password"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            disabled={isLoading}
            autoComplete="new-password"
          />
        </div>

        <Select
          label="I am a..."
          options={roleOptions}
          placeholder="Select your role"
          value={formData.role}
          onChange={(e) => updateField('role', e.target.value)}
          error={errors.role}
          disabled={isLoading}
        />

        <Select
          label="University"
          icon={Building2}
          options={universityOptions}
          value={formData.university}
          onChange={(e) => updateField('university', e.target.value)}
          helperText="Optional - helps connect you with campus services"
          disabled={isLoading}
        />

        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          className="mt-6"
        >
          Create account
        </Button>
      </form>

      {/* Sign in link */}
      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
