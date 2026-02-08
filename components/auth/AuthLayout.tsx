'use client'

import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

/**
 * Shared layout wrapper for all authentication pages
 * Provides consistent branding, animations, and responsive design
 */
export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left side - Branding (hidden on mobile) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-indigo-700 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">UniLife</span>
          </div>
        </div>
        
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Your Campus,<br />Simplified.
          </h1>
          <p className="text-lg text-indigo-100 max-w-md">
            The all-in-one platform for university life. Manage courses, connect with peers, 
            order food, and so much more — all in one place.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              { label: 'Course Management', icon: '📚' },
              { label: 'Campus Food', icon: '🍕' },
              { label: 'Study Groups', icon: '👥' },
              { label: 'Campus Rides', icon: '🚗' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-indigo-100"
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 text-indigo-200 text-sm">
          © 2026 UniLife. All rights reserved.
        </div>
      </motion.div>
      
      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">UniLife</span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-gray-500">{subtitle}</p>
            )}
          </div>
          
          {children}
        </motion.div>
      </div>
    </div>
  )
}
