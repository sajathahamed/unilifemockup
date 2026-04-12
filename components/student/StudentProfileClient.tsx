'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { validateStudentPhone } from '@/lib/student-phone'

export default function StudentProfileClient({ user, initialMobile }: { user: any, initialMobile: string }) {
  const router = useRouter()
  const [mobile, setMobile] = useState(initialMobile)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testSmsLoading, setTestSmsLoading] = useState(false)
  const [testSmsOk, setTestSmsOk] = useState<string | null>(null)
  const [gatewayDebug, setGatewayDebug] = useState<unknown>(null)
  const [phoneHint, setPhoneHint] = useState<string | null>(null)

  useEffect(() => {
    setMobile(initialMobile)
  }, [initialMobile])

  const runPhoneValidation = (value: string): boolean => {
    const r = validateStudentPhone(value)
    if (!r.ok) {
      setPhoneHint(r.message)
      return false
    }
    setPhoneHint(null)
    return true
  }

  const saveProfile = async () => {
    setError(null)
    setSaved(false)
    if (!runPhoneValidation(mobile)) return

    setLoading(true)
    try {
      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(typeof data.message === 'string' ? data.message : 'Failed to save')
      }
      if (typeof data.mobile === 'string' && data.mobile.trim()) {
        setMobile(data.mobile.trim())
      }
      setSaved(true)
      await router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const sendTestSms = async () => {
    setTestSmsLoading(true)
    setTestSmsOk(null)
    setGatewayDebug(null)
    setError(null)
    try {
      const res = await fetch('/api/student/sms/test', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setGatewayDebug(data.gateway ?? data.detail ?? null)
        const parts = [
          typeof data.message === 'string' ? data.message : 'Test SMS failed',
          typeof data.hint === 'string' ? data.hint : '',
          typeof data.fix === 'string' ? data.fix : '',
        ].filter(Boolean)
        throw new Error(parts.join('\n\n'))
      }
      setGatewayDebug(data.gateway ?? null)
      const dest =
        typeof data.destination_masked === 'string'
          ? data.destination_masked
          : typeof data.sent_to_suffix === 'string'
            ? `···${data.sent_to_suffix}`
            : 'your saved number'
      const base = `Request reached Dialog for ${dest}. Check your phone within a few minutes.`
      const note = typeof data.note === 'string' ? ` ${data.note}` : ''
      setTestSmsOk(base + note)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test SMS failed')
    } finally {
      setTestSmsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Student Profile Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={user.name} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="text" value={user.email} disabled className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
          </div>

          <div>
            <label htmlFor="profile-mobile" className="block text-sm font-medium text-gray-700 mb-1 font-bold">
              Mobile Number (for SMS Reminders)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                id="profile-mobile"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g. 94771234567 or 0771234567"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value)
                  if (phoneHint) setPhoneHint(null)
                }}
                onBlur={() => {
                  if (mobile.trim()) runPhoneValidation(mobile)
                }}
                aria-invalid={Boolean(phoneHint)}
                aria-describedby={phoneHint ? 'profile-mobile-error' : 'profile-mobile-help'}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium ${
                  phoneHint ? 'border-red-300 bg-red-50/40' : 'border-gray-200'
                }`}
              />
            </div>
            {phoneHint ? (
              <p id="profile-mobile-error" className="text-xs text-red-600 mt-2" role="alert">
                {phoneHint}
              </p>
            ) : (
              <p id="profile-mobile-help" className="text-xs text-gray-500 mt-2">
                Sri Lanka: 11 digits with 94 (e.g. 94771234567), or local 077… We store the normalized form for SMS.
              </p>
            )}
          </div>

          <button 
            onClick={saveProfile}
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {loading ? 'Saving...' : saved ? 'Saved Successfully!' : 'Save Phone Number'}
          </button>

          {saved && <p className="text-sm text-emerald-800 text-center font-medium">Phone number saved! SMS reminders will be sent to this number.</p>}
          {error && <p className="text-sm text-red-600 text-center whitespace-pre-wrap">{error}</p>}
        </div>
      </div>
    </div>
  )
}
