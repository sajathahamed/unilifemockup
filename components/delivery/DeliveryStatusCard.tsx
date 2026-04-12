'use client'

import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function DeliveryStatusCard() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null) // null = loading
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Load persisted status from DB on mount
  useEffect(() => {
    fetch('/api/delivery/status')
      .then(res => res.json())
      .then(data => {
        setIsOnline(typeof data.is_online === 'boolean' ? data.is_online : true)
      })
      .catch(() => {
        setLoadError(true)
        setIsOnline(true) // fallback
      })
  }, [])

  const handleToggleStatus = async () => {
    if (isOnline === null) return
    const nextStatus = !isOnline
    setIsSaving(true)
    try {
      const res = await fetch('/api/delivery/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_online: nextStatus }),
      })
      if (res.ok) {
        setIsOnline(nextStatus)
      } else {
        console.error('Failed to update status')
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Loading skeleton
  if (isOnline === null) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
        <h2 className="font-display text-[1.02rem] font-medium tracking-[-0.008em] text-gray-900 mb-4">Your status</h2>
        <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition">
      <h2 className="font-display text-[1.02rem] font-medium tracking-[-0.008em] text-gray-900 mb-4">Your status</h2>

      {loadError && (
        <p className="text-xs text-amber-600 mb-2">Could not load saved status — showing default.</p>
      )}
      
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
