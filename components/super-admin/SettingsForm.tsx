'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const KEYS = ['app_name', 'support_email', 'maintenance_mode', 'allow_registration', 'session_timeout_minutes'] as const

const DEFAULT_SETTINGS: Record<string, string> = {
  app_name: 'UniLife',
  support_email: 'support@unilife.edu',
  maintenance_mode: 'false',
  allow_registration: 'true',
  session_timeout_minutes: '60',
}

type SettingsState = Record<string, string>

const LABELS: Record<string, string> = {
  app_name: 'Application name',
  support_email: 'Support email',
  maintenance_mode: 'Maintenance mode',
  allow_registration: 'Allow new registrations',
  session_timeout_minutes: 'Session timeout (minutes)',
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<SettingsState>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/super-admin/settings')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.ok) {
          const next: SettingsState = {}
          KEYS.forEach((k) => (next[k] = data[k] ?? DEFAULT_SETTINGS[k] ?? ''))
          setSettings(next)
          setMessage(null)
          return
        }
        if (res.status === 403) {
          setMessage({ type: 'error', text: 'Access denied. Only super admins can view or edit settings.' })
          setSettings({ ...DEFAULT_SETTINGS })
          return
        }
        setMessage({ type: 'error', text: 'Could not load settings.' })
        setSettings({ ...DEFAULT_SETTINGS })
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Could not load settings. Check your connection.' })
        setSettings({ ...DEFAULT_SETTINGS })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/super-admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: settings.app_name || 'UniLife',
          support_email: settings.support_email || '',
          maintenance_mode: settings.maintenance_mode === 'true' ? 'true' : 'false',
          allow_registration: settings.allow_registration === 'true' ? 'true' : 'false',
          session_timeout_minutes: settings.session_timeout_minutes || '60',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved.' })
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to save.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* General */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">General</h2>
          <p className="text-sm text-gray-500 mt-0.5">App branding and contact.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{LABELS.app_name}</label>
            <input
              type="text"
              value={settings.app_name ?? ''}
              onChange={(e) => handleChange('app_name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="UniLife"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{LABELS.support_email}</label>
            <input
              type="email"
              value={settings.support_email ?? ''}
              onChange={(e) => handleChange('support_email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="support@unilife.edu"
            />
          </div>
        </div>
      </div>

      {/* Security & access */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Security & access</h2>
          <p className="text-sm text-gray-500 mt-0.5">Registration and session.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{LABELS.allow_registration}</label>
            <select
              value={settings.allow_registration ?? 'true'}
              onChange={(e) => handleChange('allow_registration', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{LABELS.session_timeout_minutes}</label>
            <input
              type="number"
              min={5}
              max={1440}
              value={settings.session_timeout_minutes ?? '60'}
              onChange={(e) => handleChange('session_timeout_minutes', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Maintenance</h2>
          <p className="text-sm text-gray-500 mt-0.5">Take the app offline for updates.</p>
        </div>
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{LABELS.maintenance_mode}</label>
            <select
              value={settings.maintenance_mode ?? 'false'}
              onChange={(e) => handleChange('maintenance_mode', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="false">Off</option>
              <option value="true">On (show maintenance page)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save changes
        </button>
      </div>
    </form>
  )
}
