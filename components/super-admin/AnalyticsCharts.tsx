'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const ROLE_COLORS: Record<string, string> = {
  student: '#0ea5e9',
  lecturer: '#6366f1',
  admin: '#3b82f6',
  'vendor-food': '#10b981',
  'vendor-laundry': '#14b8a6',
  delivery: '#f59e0b',
  super_admin: '#a855f7',
}

interface AnalyticsChartsProps {
  roleCounts: { role: string; count: number; label: string }[]
  totalUsers: number
  recentUsers: { name: string; email: string; role: string; created_at: string }[]
}

export default function AnalyticsCharts({ roleCounts, totalUsers, recentUsers }: AnalyticsChartsProps) {
  const data = roleCounts.map((r) => ({ name: r.label, count: r.count, role: r.role }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total users</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Roles</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Largest role</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">
            {data.length > 0 ? data.reduce((a, b) => (a.count > b.count ? a : b)).name : '—'}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Share (top)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalUsers > 0 && data.length > 0
              ? Math.round((data.reduce((a, b) => (a.count > b.count ? a : b)).count / totalUsers) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Users by role</h2>
          <p className="text-sm text-gray-500 mt-0.5">Distribution across platform roles.</p>
        </div>
        <div className="p-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #eee' }}
                  formatter={(value: number) => [value, 'Users']}
                  labelFormatter={(label) => `Role: ${label}`}
                />
                <Bar dataKey="count" name="Users" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ROLE_COLORS[entry.role] ?? '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Recent users</h2>
          <p className="text-sm text-gray-500 mt-0.5">Latest accounts (by creation date).</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No users yet.
                  </td>
                </tr>
              ) : (
                recentUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{u.name || '—'}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{u.email || '—'}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-medium text-gray-600 capitalize">
                        {u.role?.replace(/_/g, ' ') ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
