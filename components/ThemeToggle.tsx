'use client'

import { Sun } from 'lucide-react'

export default function ThemeToggle() {
  return (
    <div className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-700">
      <Sun size={16} />
      <span>Light</span>
    </div>
  )
}