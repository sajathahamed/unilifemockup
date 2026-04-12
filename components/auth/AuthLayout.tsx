'use client'

import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gray-50">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10"
      >
        <div>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}
            >
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">UniLife</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-gray-900">
            Your Campus,<br />Reimagined.
          </h1>
          <p className="text-lg max-w-md text-gray-600">
            The all-in-one platform for university life. Manage courses, connect with peers, 
            order food, and so much more — all in one place.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              { label: 'Course Management', icon: '📚' },
              { label: 'Campus Food', icon: '🍕' },
              { label: 'Time Management', icon: '👥' },
              { label: 'Trip Planning', icon: '🚗' },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-gray-500"
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-400">
          © 2026 UniLife. All rights reserved.
        </div>
      </motion.div>
      
      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)', boxShadow: '0 0 15px rgba(34,197,94,0.4)' }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">UniLife</span>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-gray-600">{subtitle}</p>
            )}
          </div>
          
          <div 
            className="rounded-2xl p-8 bg-white border border-gray-200 shadow-md"
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}