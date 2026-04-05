'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

export default function DeliveryStatusCard() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleStatus = async () => {
    setIsSaving(true)
    try {
      // Simulate API call - replace with actual API in production
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsOnline(!isOnline)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition">
      <h2 className="font-display text-[1.02rem] font-medium tracking-[-0.008em] text-gray-900 mb-4">Your status</h2>
      
      <div className={`flex items-center justify-between p-4 rounded-2xl border transition ${
        isOnline 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            isOnline 
              ? 'bg-emerald-500' 
              : 'bg-red-500'
          }`} aria-hidden />
          <div>
            <p className={`font-semibold ${
              isOnline 
                ? 'text-emerald-800' 
                : 'text-red-800'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
            <p className={`text-xs ${
              isOnline 
                ? 'text-emerald-700' 
                : 'text-red-700'
            }`}>
              {isOnline 
                ? 'Accepting new assignments' 
                : 'Not accepting assignments'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleToggleStatus}
          disabled={isSaving}
          className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition ${
            isOnline
              ? 'text-emerald-800 hover:bg-emerald-100'
              : 'text-red-800 hover:bg-red-100'
          } ${isSaving ? 'opacity-50 cursor-wait' : 'hover:underline'}`}
        >
          {isSaving ? 'Updating...' : (isOnline ? 'Go offline' : 'Go online')}
        </button>
      </div>

      {!isOnline && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            You won't receive any new delivery assignments while offline.
          </p>
        </div>
      )}
    </div>
  )
}
