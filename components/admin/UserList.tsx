'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, Filter, MoreVertical, X, Edit2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ROLES } from '@/lib/pages/registry'

interface User {
    id: number
    name: string
    email: string
    role: string
    uni_id?: number | null
    created_at: string
    auth_id?: string | null
    is_active?: boolean | null
}

interface UserListProps {
    users: User[]
    title?: string
    showActions?: boolean
}

function userIsActive(u: User): boolean {
    return u.is_active !== false
}

type MenuAnchor = { userId: number; rect: DOMRect }

export default function UserList({ users, title = 'User Directory', showActions = false }: UserListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [actionError, setActionError] = useState<string | null>(null)
    const [busyId, setBusyId] = useState<number | null>(null)

    const router = useRouter()
    const pathname = usePathname()
    const [activeMenu, setActiveMenu] = useState<MenuAnchor | null>(null)

    const baseEditPath = pathname.includes('/super-admin') ? '/super-admin/users' : '/admin/users'
    const usersApiBase = pathname.includes('/super-admin') ? '/api/super-admin/users' : '/api/admin/users'

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const name = user.name ?? ''
            const email = user.email ?? ''
            const matchesSearch =
                name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                email.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesRole = roleFilter === 'all' || user.role === roleFilter
            return matchesSearch && matchesRole
        })
    }, [users, searchTerm, roleFilter])

    const roleFilterOptions = ROLES

    useEffect(() => {
        if (activeMenu == null) return
        const handlePointerDown = (e: PointerEvent) => {
            const el = e.target
            if (!(el instanceof Node)) return
            const t = el as Element
            if (t.closest?.('[data-user-actions-root]') || t.closest?.('[data-user-actions-menu]')) {
                return
            }
            setActiveMenu(null)
        }
        document.addEventListener('pointerdown', handlePointerDown, true)
        return () => document.removeEventListener('pointerdown', handlePointerDown, true)
    }, [activeMenu])

    useEffect(() => {
        if (activeMenu == null) return
        const close = () => setActiveMenu(null)
        window.addEventListener('scroll', close, true)
        window.addEventListener('resize', close)
        return () => {
            window.removeEventListener('scroll', close, true)
            window.removeEventListener('resize', close)
        }
    }, [activeMenu])

    useEffect(() => {
        if (activeMenu == null) return
        if (!filteredUsers.some((u) => u.id === activeMenu.userId)) {
            setActiveMenu(null)
        }
    }, [filteredUsers, activeMenu])

    const patchUserActive = async (u: User, is_active: boolean) => {
        setActionError(null)
        setBusyId(u.id)
        try {
            const res = await fetch(`${usersApiBase}/${u.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                setActionError(typeof data?.message === 'string' ? data.message : `Update failed (${res.status})`)
                return
            }
            setActiveMenu(null)
            router.refresh()
        } catch {
            setActionError('Network error')
        } finally {
            setBusyId(null)
        }
    }

    const handleDeactivate = (u: User) => {
        if (!confirm(`Deactivate ${u.name || u.email}? They can be reactivated later.`)) return
        setActiveMenu(null)
        void patchUserActive(u, false)
    }

    const handleActivate = (u: User) => {
        setActiveMenu(null)
        void patchUserActive(u, true)
    }

    const menuUser = activeMenu ? filteredUsers.find((x) => x.id === activeMenu.userId) : undefined
    const menuPlacement = (() => {
        if (!activeMenu || typeof window === 'undefined') return null
        const pad = 8
        const menuMinW = 232
        const vw = window.innerWidth
        const right = Math.min(vw - pad, activeMenu.rect.right)
        let left = right - menuMinW
        if (left < pad) left = pad
        const top = activeMenu.rect.bottom + 6
        const maxW = Math.min(280, vw - pad * 2)
        return { top, left, minWidth: menuMinW, maxWidth: maxW }
    })()

    const actionsPortal =
        showActions &&
        activeMenu &&
        menuUser &&
        menuPlacement &&
        typeof document !== 'undefined' &&
        createPortal(
            <div
                data-user-actions-menu
                role="menu"
                className="fixed z-[300] rounded-xl border border-gray-100 bg-white py-1.5 shadow-2xl"
                style={{
                    top: menuPlacement.top,
                    left: menuPlacement.left,
                    minWidth: menuPlacement.minWidth,
                    maxWidth: menuPlacement.maxWidth,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <Link
                    href={`${baseEditPath}/edit/${menuUser.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-normal"
                    onClick={() => setActiveMenu(null)}
                >
                    <Edit2 size={14} className="text-gray-400 shrink-0" />
                    <span className="text-left leading-snug">Edit profile</span>
                </Link>
                <div className="h-px bg-gray-100 my-1" />
                {userIsActive(menuUser) ? (
                    <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm text-amber-900 hover:bg-amber-50 transition-colors"
                        onClick={() => handleDeactivate(menuUser)}
                    >
                        <ToggleLeft size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <span className="min-w-0 leading-snug break-words">Deactivate account</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left text-sm text-emerald-900 hover:bg-emerald-50 transition-colors"
                        onClick={() => handleActivate(menuUser)}
                    >
                        <ToggleRight size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <span className="min-w-0 leading-snug break-words">Activate account</span>
                    </button>
                )}
            </div>,
            document.body
        )

    return (
        <>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
            <div className="p-4 border-b border-gray-100 space-y-4 shrink-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                    <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-lg shrink-0">
                        {filteredUsers.length} of {users.length} Users
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            suppressHydrationWarning={true}
                            className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="relative min-w-[150px] shrink-0">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full appearance-none pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                            <option value="all">All Roles</option>
                            {roleFilterOptions.map((role) => (
                                <option key={role} value={role}>
                                    {formatRole(role)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {actionError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex items-start justify-between gap-2">
                        <span>{actionError}</span>
                        <button type="button" className="text-red-600 hover:text-red-800 shrink-0 font-medium" onClick={() => setActionError(null)}>
                            Dismiss
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto overscroll-x-contain min-w-0">
                <table className="w-full text-left min-w-[600px] table-fixed">
                    <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100">
                        <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                            <th className="px-5 py-3 w-[38%] min-w-[200px]">User</th>
                            <th className="px-5 py-3 w-[22%]">Role</th>
                            <th className="px-5 py-3 hidden sm:table-cell w-[24%]">Joined</th>
                            {showActions && (
                                <th className="px-3 py-3 w-14 text-right sticky right-0 z-30 bg-gray-50/95 backdrop-blur-sm border-l border-gray-100 shadow-[-6px_0_14px_-8px_rgba(0,0,0,0.12)]" />
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={showActions ? 4 : 3} className="px-5 py-12 text-center text-gray-400 italic text-sm">
                                    {searchTerm || roleFilter !== 'all'
                                        ? 'No users match your current filters.'
                                        : 'No users found in the system.'}
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => {
                                const initials = getInitials(u.name)
                                const active = userIsActive(u)
                                return (
                                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-5 py-3.5 align-middle">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{u.name || '—'}</p>
                                                        {!active && (
                                                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400 truncate">{u.email || '—'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 align-middle">
                                            <span
                                                className={`inline-flex max-w-full px-2.5 py-1 rounded-lg text-xs font-semibold border whitespace-nowrap truncate ${getRoleStyles(u.role)}`}
                                            >
                                                {formatRole(u.role)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 hidden sm:table-cell align-middle">
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {u.created_at
                                                    ? new Date(u.created_at).toLocaleDateString('en-GB', {
                                                          year: 'numeric',
                                                          month: 'short',
                                                          day: 'numeric',
                                                      })
                                                    : '—'}
                                            </span>
                                        </td>
                                        {showActions && (
                                            <td className="px-2 py-3 text-right align-middle sticky right-0 z-10 bg-white group-hover:bg-gray-50/95 border-l border-gray-100 shadow-[-6px_0_14px_-8px_rgba(0,0,0,0.08)] w-14">
                                                <div className="relative inline-flex flex-col items-end" data-user-actions-root>
                                                    <button
                                                        type="button"
                                                        aria-expanded={activeMenu?.userId === u.id}
                                                        aria-haspopup="menu"
                                                        aria-label="User actions"
                                                        disabled={busyId === u.id}
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            const rect = e.currentTarget.getBoundingClientRect()
                                                            setActiveMenu((prev) =>
                                                                prev?.userId === u.id ? null : { userId: u.id, rect }
                                                            )
                                                        }}
                                                        className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                                                            activeMenu?.userId === u.id
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'hover:bg-gray-100 text-gray-500 group-hover:text-gray-600'
                                                        }`}
                                                    >
                                                        {busyId === u.id ? (
                                                            <Loader2 size={18} className="animate-spin" />
                                                        ) : (
                                                            <MoreVertical size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
        {actionsPortal}
        </>
    )
}

function getInitials(name: string | null | undefined): string {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatRole(role: string): string {
    return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getRoleStyles(role: string): string {
    switch (role?.toLowerCase()) {
        case 'super_admin':
            return 'bg-stone-100 text-stone-800 border-stone-200'
        case 'admin':
            return 'bg-blue-50 text-blue-700 border-blue-100'
        case 'vendor-food':
        case 'vendor_admin':
            return 'bg-emerald-50 text-emerald-700 border-emerald-100'
        case 'vendor-laundry':
            return 'bg-teal-50 text-teal-700 border-teal-100'
        case 'delivery':
        case 'delivery_rider':
            return 'bg-green-50 text-green-700 border-green-100'
        case 'lecturer':
            return 'bg-lime-50 text-lime-800 border-lime-100'
        case 'student':
            return 'bg-sky-50 text-sky-700 border-sky-100'
        default:
            return 'bg-gray-50 text-gray-600 border-gray-200'
    }
}
