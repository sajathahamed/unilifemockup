'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getRoleBasedRedirect, UserRole } from '@/lib/auth'
import { GoogleButton, Button, Input, Select, Alert } from '@/components'

// Available roles for signup (no generic vendor - only vendor-food, vendor-laundry)
const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'vendor-food', label: 'Food Vendor' },
  { value: 'vendor-laundry', label: 'Laundry Vendor' },
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

  // Supabase client created inside handlers to avoid build-time env usage

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
      const supabase = createClient()

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
      const supabase = createClient()

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
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 relative animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse animation-delay-4000" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 p-10 bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] shadow-2xl max-w-lg w-full text-center mx-4"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-green-200 mb-8 transform rotate-3 hover:rotate-0 transition-transform">
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </motion.svg>
          </div>
          <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-3 tracking-tight">Check your email</h2>
          <p className="text-gray-500 mb-8 text-lg font-medium">
            We've sent a verification link to <span className="font-bold text-indigo-600 block mt-1">{formData.email}</span>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-4 px-6 rounded-xl text-white font-semibold flex gap-2 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#f4f7fb]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-indigo-500/10 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-purple-500/10 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col lg:flex-row shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl border border-white m-4 lg:m-8">
        
        {/* Left Side: Editorial Banner */}
        <div className="hidden lg:flex w-[48%] bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-xl">
                <span className="text-2xl font-black text-white">UL</span>
              </div>
            </Link>
          </div>

          <div className="relative z-10 mb-20 space-y-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[3.5rem] font-black leading-[1.05] tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-200"
            >
              Start your<br/>campus journey<br/><span className="text-indigo-400">today.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-indigo-100/70 max-w-sm font-medium leading-relaxed"
            >
              Join thousands of students and staff making campus life easier, smarter, and more connected.
            </motion.p>
            
            <div className="pt-8 grid grid-cols-2 gap-x-6 gap-y-8">
              {[
                { title: 'Smart Timetable', desc: 'Never miss a class' },
                { title: 'Campus Food', desc: 'Order direct to dorm' },
                { title: 'Laundry', desc: 'Doorstep pickup' },
                { title: 'Connect', desc: 'Find study groups' },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  className="flex flex-col gap-1 border-l-2 border-indigo-500/30 pl-4"
                >
                  <span className="font-bold text-white tracking-wide">{item.title}</span>
                  <span className="text-sm text-indigo-300/70">{item.desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full lg:w-[52%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white/60 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full mx-auto"
          >
            {/* Mobile Title */}
            <div className="lg:hidden mb-10 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-6">
                 <span className="text-2xl font-black text-white">UL</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create account</h2>
            </div>

            {/* Desktop Title */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create account</h2>
              <p className="text-gray-500 font-medium mt-2">Sign up in seconds, unlock your campus.</p>
            </div>

            <AnimatePresence mode="wait">
              {generalError && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <Alert type="error" message={generalError} onClose={() => setGeneralError(null)} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="hover:scale-[1.01] transition-transform duration-300">
              <GoogleButton
                onClick={handleGoogleSignup}
                isLoading={isGoogleLoading}
                text="Continue with Google"
              />
            </div>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">or register using email</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Full name"
                type="text"
                placeholder="John Doe"
                icon={User}
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                error={errors.fullName}
                disabled={isLoading}
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
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 chars"
                  icon={Lock}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  error={errors.password}
                  disabled={isLoading}
                />

                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat password"
                  icon={Lock}
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="I am a..."
                  options={roleOptions}
                  placeholder="Select role"
                  value={formData.role}
                  onChange={(e) => updateField('role', e.target.value)}
                  error={errors.role}
                  disabled={isLoading}
                />

                <Select
                  label="University (Optional)"
                  options={universityOptions}
                  icon={Building2}
                  value={formData.university}
                  onChange={(e) => updateField('university', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 shadow-sm"
                  />
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    I agree to the{' '}
                    <Link href="/terms" className="text-gray-900 font-semibold border-b border-gray-900/30 hover:border-gray-900 transition-colors">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-gray-900 font-semibold border-b border-gray-900/30 hover:border-gray-900 transition-colors">Privacy Policy</Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 py-3.5 px-6 rounded-xl text-white font-bold tracking-wide bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-sm font-medium text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 font-bold tracking-wide"
              >
                Sign in securely
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
