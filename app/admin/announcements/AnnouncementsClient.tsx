'use client'

import { useEffect, useState } from 'react'
import { requireMinLen10 } from '@/lib/admin/validation'

type Announcement = {
  id: number
  title: string
  body: string
  target_audience: string | null
  created_at: string
  created_by?: number
}

export default function AnnouncementsClient() {
  const [list, setList] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; body?: string }>({})

  const readJsonSafe = async (res: Response) => {
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '')
      throw new Error(
        `API returned non-JSON (${res.status}). ${text ? 'Are you logged in as admin?' : ''}`.trim()
      )
    }
    return res.json()
  }

  const fetchList = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/announcements')
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.message || 'Failed to load')
      setList(Array.isArray(data) ? data : [])
    } catch (e) {
      setList([])
      setError(e instanceof Error ? e.message : 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    const tErr = requireMinLen10(title, 'Title')
    const bErr = requireMinLen10(body, 'Message')
    if (tErr || bErr) {
      setFieldErrors({ ...(tErr ? { title: tErr } : {}), ...(bErr ? { body: bErr } : {}) })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          target_audience: audience === 'all' ? null : audience,
        }),
      })
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.message || 'Failed to post')
      setTitle('')
      setBody('')
      setAudience('all')
      await fetchList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post announcement')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Post announcement</h2>
        <p className="text-sm text-gray-500 mb-4">
          Title and message must be at least 10 characters. Pick who should see the notice.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title * (min 10 characters)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Announcement title"
            />
            {fieldErrors.title && <p className="mt-1.5 text-sm text-red-500">{fieldErrors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message * (min 10 characters)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Full message..."
            />
            {fieldErrors.body && <p className="mt-1.5 text-sm text-red-500">{fieldErrors.body}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Everyone</option>
              <option value="student">Students</option>
              <option value="lecturer">Lecturers</option>
              <option value="admin">Admins</option>
              <option value="vendor-food">Food Vendors</option>
              <option value="vendor-laundry">Laundry Vendors</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Recent announcements</h2>
        <p className="text-sm text-gray-500 mb-4">
          List and manage existing announcements.
        </p>
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : list.length === 0 ? (
          <div className="text-sm text-gray-400 italic">No announcements yet.</div>
        ) : (
          <ul className="space-y-3 max-h-[400px] overflow-y-auto">
            {list.map((a) => (
              <li key={a.id} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="font-medium text-gray-900">{a.title}</div>
                {a.body && <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{a.body}</div>}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(a.created_at).toLocaleString()}
                  {a.target_audience && ` · ${a.target_audience}`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
