'use client'

import { useState, useEffect } from 'react'
import { LayoutList, Loader2, Check, X } from 'lucide-react'
import type { UserRole } from '@/lib/auth'

interface PageWithPerm {
  page_id: number
  path: string
  label: string
  role: string
  icon: string
  sort_order: number
  enabled: boolean
}

interface PageManagementClientProps {
  roles: UserRole[]
}

export function PageManagementClient({ roles }: PageManagementClientProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(roles[0])
  const [pages, setPages] = useState<PageWithPerm[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/super-admin/pages?role=${selectedRole}`)
      .then((res) => res.json())
      .then((data) => {
        setPages(data.pages || [])
      })
      .catch(() => setPages([]))
      .finally(() => setLoading(false))
  }, [selectedRole])

  const toggle = async (pageId: number, enabled: boolean) => {
    setSavingId(pageId)
    try {
      const res = await fetch('/api/super-admin/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole, page_id: pageId, enabled }),
      })
      if (res.ok) {
        setPages((prev) => prev.map((p) => (p.page_id === pageId ? { ...p, enabled } : p)))
      }
    } finally {
      setSavingId(null)
    }
  }

  const roleLabels: Record<UserRole, string> = {
    student: 'Student',
    lecturer: 'Lecturer',
    admin: 'Admin',
    vendor: 'Vendor',
    'vendor-food': 'Food Vendor',
    'vendor-laundry': 'Laundry Vendor',
    delivery: 'Delivery',
    super_admin: 'Super Admin',
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <LayoutList size={20} className="text-gray-500" />
        <span className="font-medium text-gray-700">Role</span>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r] || r}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 ml-2">
          Toggle which pages appear in the sidebar for this role.
        </p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : pages.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No pages found for this role.</p>
        ) : (
          <ul className="space-y-2">
            {pages.map((p) => (
              <li
                key={p.page_id}
                className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{p.label}</p>
                  <p className="text-sm text-gray-500 truncate">{p.path}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">ID: {p.page_id}</span>
                  <button
                    onClick={() => toggle(p.page_id, !p.enabled)}
                    disabled={savingId === p.page_id}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${p.enabled
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {savingId === p.page_id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : p.enabled ? (
                      <>
                        <Check size={14} /> Enabled
                      </>
                    ) : (
                      <>
                        <X size={14} /> Disabled
                      </>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
