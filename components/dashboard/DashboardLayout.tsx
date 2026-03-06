'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  ShoppingBag,
  Utensils,
  Car,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Package,
  Briefcase,
  Store,
  Truck,
  Shield,
  BarChart3,
  UserCog,
  LayoutList,
  LucideIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/auth'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: number
    auth_id: string
    name: string
    email: string
    role: UserRole
    avatar_url?: string
  }
}

// Navigation items for each role
const roleNavItems: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Courses', href: '/student/courses', icon: BookOpen },
    { label: 'Timetable', href: '/student/timetable', icon: Calendar },
    { label: 'Study Groups', href: '/student/study-groups', icon: Users },
    { label: 'Marketplace', href: '/student/marketplace', icon: ShoppingBag },
    { label: 'Food Order', href: '/student/food-order', icon: Utensils },
    { label: 'Laundry', href: '/student/laundry', icon: Truck },
  ],
  lecturer: [
    { label: 'Dashboard', href: '/lecturer/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/lecturer/courses', icon: BookOpen },
    { label: 'Schedule', href: '/lecturer/schedule', icon: Calendar },
    { label: 'Students', href: '/lecturer/students', icon: Users },
    { label: 'Assignments', href: '/lecturer/assignments', icon: Briefcase },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Courses', href: '/admin/courses', icon: BookOpen },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Announcements', href: '/admin/announcements', icon: Bell },
  ],
  vendor: [
    { label: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
    { label: 'Food Orders', href: '/vendor/orders', icon: Package },
    { label: 'Laundry Orders', href: '/vendor/laundry/orders', icon: Truck },
    { label: 'Menu', href: '/vendor/menu', icon: Utensils },
    { label: 'Store Settings', href: '/vendor/settings', icon: Store },
    { label: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
  ],
  delivery: [
    { label: 'Dashboard', href: '/delivery/dashboard', icon: LayoutDashboard },
    { label: 'Food Deliveries', href: '/delivery/active', icon: Package },
    { label: 'Laundry Jobs', href: '/delivery/laundry', icon: Truck },
    { label: 'Earnings', href: '/delivery/earnings', icon: BarChart3 },
  ],
  super_admin: [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'All Users', href: '/super-admin/users', icon: UserCog },
    { label: 'Roles & Permissions', href: '/super-admin/roles', icon: Shield },
    { label: 'System Analytics', href: '/super-admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/super-admin/settings', icon: Settings },
    { label: 'Page Management', href: '/super-admin/pages', icon: LayoutList },
  ],
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  ShoppingBag,
  Utensils,
  Car,
  Bell,
  Settings,
  Package,
  Briefcase,
  Store,
  Truck,
  Shield,
  BarChart3,
  UserCog,
  LayoutList,
}

// Role display names and colors
const roleConfig: Record<UserRole, { label: string; color: string }> = {
  student: { label: 'Student', color: 'bg-blue-100 text-blue-800' },
  lecturer: { label: 'Lecturer', color: 'bg-purple-100 text-purple-800' },
  admin: { label: 'Admin', color: 'bg-orange-100 text-orange-800' },
  vendor: { label: 'Vendor', color: 'bg-green-100 text-green-800' },
  delivery: { label: 'Delivery', color: 'bg-yellow-100 text-yellow-800' },
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-800' },
}

function getRoleFromHref(href: string): UserRole | null {
  if (href.startsWith('/student/')) return 'student'
  if (href.startsWith('/lecturer/')) return 'lecturer'
  if (href.startsWith('/admin/')) return 'admin'
  if (href.startsWith('/vendor/')) return 'vendor'
  if (href.startsWith('/delivery/')) return 'delivery'
  if (href.startsWith('/super-admin/')) return 'super_admin'
  return null
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [supabase, setSupabase] = useState<any | null>(null)
  const [apiNavItems, setApiNavItems] = useState<NavItem[] | null>(null)
  const [superAdminFilter, setSuperAdminFilter] = useState<string>('all')
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    fetch('/api/nav')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const items = (data?.items || []).map((i: { label: string; href: string; icon: string }) => ({
          label: i.label,
          href: i.href,
          icon: ICON_MAP[i.icon] || LayoutDashboard,
        }))
        setApiNavItems(items.length ? items : null)
      })
      .catch(() => setApiNavItems(null))
  }, [user.role])

  const navItems: NavItem[] = apiNavItems ?? roleNavItems[user.role]
  const filteredNavItems: NavItem[] =
    user.role === 'super_admin' && superAdminFilter !== 'all'
      ? navItems.filter((item) => {
          const r = getRoleFromHref(item.href)
          return r === superAdminFilter
        })
      : navItems
  const roleInfo = roleConfig[user.role]

  // Group nav items by role for collapsible sections
  const groupedNavItems = filteredNavItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const itemRole = getRoleFromHref(item.href) || user.role
    if (!acc[itemRole]) acc[itemRole] = []
    acc[itemRole].push(item)
    return acc
  }, {})

  // Toggle role section expansion
  const toggleRoleExpansion = (role: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(role)) {
        next.delete(role)
      } else {
        next.add(role)
      }
      return next
    })
  }

  // Auto-expand the role section containing the current active path
  useEffect(() => {
    const activeRole = getRoleFromHref(pathname)
    if (activeRole && !expandedRoles.has(activeRole)) {
      setExpandedRoles((prev) => new Set([...prev, activeRole]))
    }
  }, [pathname])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const client = supabase ?? createClient()
    await client.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link href={`/${user.role.replace('_', '-')}/dashboard`} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">UniLife</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {user.role === 'super_admin' && (
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500">Filter by role</span>
                <select
                  value={superAdminFilter}
                  onChange={(e) => setSuperAdminFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All</option>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="delivery">Delivery</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}
            <ul className="space-y-1">
              {Object.entries(groupedNavItems).map(([role, items]) => {
                const isExpanded = expandedRoles.has(role)
                const config = roleConfig[role as UserRole]
                const RoleIcon = items[0]?.icon || LayoutDashboard
                
                return (
                  <li key={role}>
                    {/* Role group header */}
                    <button
                      onClick={() => toggleRoleExpansion(role)}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <RoleIcon size={20} />
                        <span>{config?.label || role}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {/* Collapsible items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-4 mt-1 space-y-1"
                        >
                          {items.map((item) => {
                            const isActive = pathname === item.href
                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={() => setIsSidebarOpen(false)}
                                  className={`
                                    flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive
                                      ? 'bg-primary text-white shadow-sm'
                                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }
                                  `}
                                >
                                  <item.icon size={18} />
                                  <span>{item.label}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User profile section */}
          <div className="p-4 border-t border-gray-100">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <Link
                      href={`/${user.role.replace('_', '-')}/settings`}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={18} />
                      <span className="text-sm">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Mobile profile */}
              <div className="lg:hidden">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-primary">
                      {getInitials(user.name)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
