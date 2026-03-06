'use client'

import { useState, useEffect } from 'react'
import { LayoutList, Loader2, Check, X, Users, Shield } from 'lucide-react'
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

interface UserRow {
  id: number
  email: string
  name: string
  role: string
}

interface PageManagementClientProps {
  roles: UserRole[]
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Student',
  lecturer: 'Lecturer',
  admin: 'Admin',
  vendor: 'Vendor',
  delivery: 'Delivery',
  super_admin: 'Super Admin',
}

export function PageManagementClient({ roles }: PageManagementClientProps) {
  const [mode, setMode] = useState<'role' | 'user'>('role')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole>(roles[0])
  const [pages, setPages] = useState<PageWithPerm[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const [userSearch, setUserSearch] = useState('')
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('')
  const [users, setUsers] = useState<UserRow[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [userEmailInput, setUserEmailInput] = useState('')
  const [userError, setUserError] = useState<string | null>(null)

  const fetchJsonSafe = async (url: string) => {
    const res = await fetch(url)
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '')
      throw new Error(`API returned non-JSON (${res.status}). ${text ? 'Check login/role.' : ''}`.trim())
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`)
    return data
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUserSearch(userSearch), 350)
    return () => clearTimeout(t)
  }, [userSearch])

  useEffect(() => {
    setLoading(true)
    setApiError(null)
    if (mode === 'role') {
      const rolesToFetch = selectedRoles.length > 0 ? selectedRoles[0] : selectedRole
      if (selectedRoles.length > 1) {
        fetchJsonSafe('/api/super-admin/pages')
          .then((data) => {
            const allPages = data.pages || []
            const mapped = allPages.map((p: any) => ({
              page_id: p.id ?? p.page_id,
              path: p.path,
              label: p.label,
              role: p.role,
              icon: p.icon,
              sort_order: p.sort_order ?? 0,
              enabled: true,
            }))
            setPages(mapped)
          })
          .catch((e) => {
            setPages([])
            setApiError(e instanceof Error ? e.message : 'Failed to load pages')
          })
          .finally(() => setLoading(false))
      } else {
        fetchJsonSafe(`/api/super-admin/pages?role=${rolesToFetch}`)
          .then((data) => setPages(data.pages || []))
          .catch((e) => {
            setPages([])
            setApiError(e instanceof Error ? e.message : 'Failed to load pages')
          })
          .finally(() => setLoading(false))
      }
    } else {
      if (selectedUserId) {
        fetchJsonSafe(`/api/super-admin/pages?user_id=${selectedUserId}`)
          .then((data) => setPages(data.pages || []))
          .catch((e) => {
            setPages([])
            setApiError(e instanceof Error ? e.message : 'Failed to load pages')
          })
          .finally(() => setLoading(false))
      } else {
        setPages([])
        setLoading(false)
      }
    }
  }, [mode, selectedRole, selectedRoles.length, selectedRoles.join(','), selectedUserId])

  useEffect(() => {
    if (mode === 'user' && selectedRole) {
      const q = `role=${selectedRole}&users=1&search=${encodeURIComponent(debouncedUserSearch)}`
      fetchJsonSafe(`/api/super-admin/pages?${q}`)
        .then((data) => setUsers(data.users || []))
        .catch(() => setUsers([]))
    } else if (mode === 'role') {
      setUsers([])
    }
  }, [mode, selectedRole, debouncedUserSearch])

  const toggleRole = async (pageId: number, enabled: boolean) => {
    setSavingId(pageId)
    try {
      const res = await fetch('/api/super-admin/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedRoles.length > 1 ? 'role_bulk' : 'role',
          role: selectedRoles.length > 0 ? selectedRoles[0] : selectedRole,
          roles: selectedRoles.length > 1 ? selectedRoles : undefined,
          page_id: pageId,
          enabled,
        }),
      })
      if (res.ok) {
        setPages((prev) => prev.map((p) => (p.page_id === pageId ? { ...p, enabled } : p)))
        window.dispatchEvent(new CustomEvent('unilife-nav-invalidated'))
      }
    } finally {
      setSavingId(null)
    }
  }

  const toggleUser = async (pageId: number, enabled: boolean) => {
    if (!selectedUserId) return
    setUserError(null)
    setSavingId(pageId)
    try {
      const res = await fetch('/api/super-admin/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'user', user_id: Number(selectedUserId), page_id: Number(pageId), enabled }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setPages((prev) => prev.map((p) => (p.page_id === pageId ? { ...p, enabled } : p)))
        window.dispatchEvent(new CustomEvent('unilife-nav-invalidated'))
      } else {
        setUserError(data?.message || `Failed to update (${res.status})`)
      }
    } finally {
      setSavingId(null)
    }
  }

  const toggle = mode === 'user' ? toggleUser : toggleRole

  const lookupByEmail = () => {
    if (!userEmailInput.trim()) return
    fetchJsonSafe(`/api/super-admin/pages?email=${encodeURIComponent(userEmailInput.trim())}`)
      .then((data) => {
        if (data.user) {
          const u = data.user as UserRow
          setSelectedUserId(u.id)
          setSelectedRole(u.role as UserRole)
          setUsers((prev) => (prev.some((x) => x.id === u.id) ? prev : [u, ...prev]))
        }
      })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
        <LayoutList size={20} className="text-gray-500" />
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('role'); setUserError(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              mode === 'role' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Shield size={16} /> By Role
          </button>
          <button
            onClick={() => { setMode('user'); setUserError(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              mode === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users size={16} /> By User (Email / ID)
          </button>
        </div>

        {mode === 'role' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Filter role(s):</span>
            <div className="flex gap-1 flex-wrap">
              {roles.map((r) => (
                <label key={r} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRoles((prev) => [...prev, r])
                      else setSelectedRoles((prev) => prev.filter((x) => x !== r))
                    }}
                  />
                  <span className="text-sm">{ROLE_LABELS[r] || r}</span>
                </label>
              ))}
            </div>
            {selectedRoles.length === 0 && (
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500">
              {selectedRoles.length > 1 ? `Apply to ${selectedRoles.length} roles at once` : 'Select one role or multi-select for bulk'}
            </p>
          </div>
        )}

        {mode === 'user' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as UserRole)
                setSelectedUserId(null)
              }}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">User:</span>
            <input
              type="text"
              placeholder="Search by name/email or paste email"
              value={userEmailInput || userSearch}
              onChange={(e) => {
                setUserEmailInput(e.target.value)
                setUserSearch(e.target.value)
              }}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm w-64"
            />
            <button
              onClick={lookupByEmail}
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              Lookup
            </button>
            <select
              value={selectedUserId ?? ''}
              onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
              className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm min-w-[200px]"
            >
              <option value="">— Select user —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.email} ({u.name})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="p-4">
        {apiError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {apiError}
          </div>
        )}
        {mode === 'user' && userError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between gap-2">
            <span>{userError}</span>
            <button type="button" onClick={() => setUserError(null)} className="text-red-600 hover:underline">Dismiss</button>
          </div>
        )}
        {mode === 'user' && !selectedUserId && (
          <p className="text-gray-500 py-8 text-center">Select or search for a user to manage their page privileges.</p>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-primary" />
          </div>
        ) : pages.length === 0 && (mode === 'role' || selectedUserId) ? (
          <p className="text-gray-500 py-8 text-center">No pages found.</p>
        ) : (
          <ul className="space-y-2">
            {pages.map((p) => (
              <li
                key={p.page_id}
                className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{p.label}</p>
                  <p className="text-sm text-gray-500 truncate">{p.path} {mode === 'role' && `(${ROLE_LABELS[p.role] || p.role})`}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">ID: {p.page_id}</span>
                  <button
                    onClick={() => toggle(p.page_id, !p.enabled)}
                    disabled={savingId === p.page_id || (mode === 'user' && !selectedUserId)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                      ${p.enabled ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                  >
                    {savingId === p.page_id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : p.enabled ? (
                      <><Check size={14} /> Enabled</>
                    ) : (
                      <><X size={14} /> Disabled</>
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
