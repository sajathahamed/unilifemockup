import { GraduationCap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer spinning ring */}
          <div 
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary/30 animate-spin"
            style={{ margin: '-0.5rem' }}
          />
          
          {/* Inner pulsing circle with icon */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <GraduationCap size={28} className="text-primary" />
          </div>
        </div>

        <p className="text-gray-500 font-medium text-sm animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  )
}
