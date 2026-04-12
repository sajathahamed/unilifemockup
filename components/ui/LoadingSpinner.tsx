'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Utensils, Truck, Package, Users } from 'lucide-react'

type SpinnerVariant = 'default' | 'academic' | 'food' | 'laundry' | 'delivery' | 'users'

interface LoadingSpinnerProps {
  variant?: SpinnerVariant
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const spinnerConfig = {
  default: {
    icon: GraduationCap,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  academic: {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  food: {
    icon: Utensils,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  laundry: {
    icon: Truck,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  delivery: {
    icon: Package,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  users: {
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
}

const sizeConfig = {
  sm: { container: 'w-10 h-10', icon: 16, ring: 'w-12 h-12' },
  md: { container: 'w-16 h-16', icon: 24, ring: 'w-20 h-20' },
  lg: { container: 'w-24 h-24', icon: 36, ring: 'w-28 h-28' },
}

export default function LoadingSpinner({ 
  variant = 'default', 
  size = 'md',
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const config = spinnerConfig[variant]
  const sizeSettings = sizeConfig[size]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <motion.div
          className={`absolute inset-0 ${sizeSettings.ring} rounded-full border-4 border-transparent border-t-primary/30`}
          style={{ margin: '-0.5rem' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner pulsing circle with icon */}
        <motion.div
          className={`${sizeSettings.container} ${config.bgColor} rounded-full flex items-center justify-center`}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={sizeSettings.icon} className={config.color} />
          </motion.div>
        </motion.div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
            style={{
              top: '50%',
              left: '50%',
              marginTop: '-4px',
              marginLeft: '-4px',
            }}
            animate={{
              x: [0, 30, 0, -30, 0],
              y: [-30, 0, 30, 0, -30],
              opacity: [1, 0.5, 1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      <motion.p
        className="text-gray-500 font-medium text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.p>
    </div>
  )
}

// Full page loading overlay
export function PageLoader({ 
  variant = 'default',
  text = 'Loading...'
}: { variant?: SpinnerVariant; text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner variant={variant} size="lg" text={text} />
    </div>
  )
}

// Inline/card loading state
export function CardLoader({ 
  variant = 'default',
  text = 'Loading...'
}: { variant?: SpinnerVariant; text?: string }) {
  return (
    <div className="w-full py-12 flex items-center justify-center">
      <LoadingSpinner variant={variant} size="md" text={text} />
    </div>
  )
}

// Button loading spinner
export function ButtonSpinner() {
  return (
    <motion.div
      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
    />
  )
}
