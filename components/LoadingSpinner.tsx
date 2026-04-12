'use client'

import { GraduationCap } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Circular spinner with icon */}
        <div className="relative w-24 h-24">
          {/* Rotating outer ring */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-300 animate-spin"
          />
          
          {/* Center circle with icon */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-lg shadow-blue-200/50">
            <GraduationCap size={32} className="text-blue-600" />
          </div>
        </div>

        {/* Loading text */}
        <p className="text-gray-600 font-medium text-sm">
          Loading...
        </p>
      </div>
    </div>
  )
}
