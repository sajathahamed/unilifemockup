'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Users, ShoppingBag, Truck, FileText } from 'lucide-react'

type ReportStats = {
  users: { total: number; byRole: Record<string, number> }
  laundry_shops: number
  food_stalls: number
  timetable_entries: number
  announcements: number
}

export default function ReportsClient() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

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

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/reports')
      const data = await readJsonSafe(res)
      if (!res.ok) throw new Error(data?.message || 'Failed to load')
      setStats(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/reports?format=csv')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `admin-report-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-500 shadow-sm">
        Loading report data…
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm">
        {error}
        <button type="button" onClick={fetchStats} className="ml-3 text-sm font-medium text-red-700 underline">
          Retry
        </button>
      </div>
    )
  }
  if (!stats) return null

  const cards = [
    {
      icon: Users,
      title: 'User activity',
      description: 'Logins, signups, and role distribution.',
      value: stats.users.total,
      detail: Object.entries(stats.users.byRole).map(([role, n]) => `${role}: ${n}`).join(', '),
    },
    {
      icon: ShoppingBag,
      title: 'Food stalls',
      description: 'Registered food stalls.',
      value: stats.food_stalls,
    },
    {
      icon: Truck,
      title: 'Laundry shops',
      description: 'Registered laundry shops.',
      value: stats.laundry_shops,
    },
    {
      icon: FileText,
      title: 'Export',
      description: 'Export data for external analysis.',
      action: true,
    },
  ]

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <card.icon size={20} />
            </div>
            <h3 className="font-semibold text-gray-900">{card.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
            {'action' in card && card.action ? (
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="mt-3 text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            ) : (
              <p className="mt-3 text-lg font-semibold text-gray-900">
                {card.value}
                {card.detail && <span className="block text-sm font-normal text-gray-500">{card.detail}</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Report summary</h2>
        <p className="text-sm text-gray-500 mb-4">
          Current platform stats. Use Export above to download as CSV.
        </p>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 font-medium text-gray-700">Metric</th>
              <th className="py-2 font-medium text-gray-700">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Total users</td><td className="py-2">{stats.users.total}</td></tr>
            {Object.entries(stats.users.byRole).map(([role, n]) => (
              <tr key={role} className="border-b border-gray-100"><td className="py-2 text-gray-600">Users ({role})</td><td className="py-2">{n}</td></tr>
            ))}
            <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Laundry shops</td><td className="py-2">{stats.laundry_shops}</td></tr>
            <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Food stalls</td><td className="py-2">{stats.food_stalls}</td></tr>
            <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Timetable entries</td><td className="py-2">{stats.timetable_entries}</td></tr>
            <tr className="border-b border-gray-100"><td className="py-2 text-gray-600">Announcements</td><td className="py-2">{stats.announcements}</td></tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
