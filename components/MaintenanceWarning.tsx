'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface MaintenanceWarningProps {
  message: string
  startTime: string
  endTime: string
}

export default function MaintenanceWarning({ message, startTime, endTime }: MaintenanceWarningProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!startTime || !endTime) return

    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    // Check if current time is within the maintenance warning window
    if (now >= start && now <= end) {
      // Show warning unless user already dismissed it this session
      const dismissed = sessionStorage.getItem('maintenance_warning_dismissed')
      if (dismissed !== 'true') {
        setIsVisible(true)
      }
    }
  }, [startTime, endTime])

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('maintenance_warning_dismissed', 'true')
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
          
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Upcoming Maintenance</h2>
            
            <p className="text-gray-600 mb-6 whitespace-pre-wrap text-sm leading-relaxed">
              {message || "The site will be undergoing scheduled maintenance soon. Some features might be unavailable."}
            </p>
            

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              I understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
