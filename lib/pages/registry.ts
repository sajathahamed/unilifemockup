/**
 * Central page registry for UniLife.
 * Every navigable page has a unique id and is associated with a role.
 * Used to seed app_pages and as fallback when DB is empty.
 * Super Admin sees all pages; other roles see only their role's pages (filtered by permissions in DB).
 */

import type { UserRole } from '@/lib/auth'

export interface PageRecord {
  id: number
  path: string
  label: string
  role: UserRole
  icon: string
  sort_order: number
}

/** All app pages with unique IDs. path is the main href for nav (exact or base path). */
export const PAGE_REGISTRY: PageRecord[] = [
  // Student (1–12)
  { id: 1, path: '/student/dashboard', label: 'Dashboard', role: 'student', icon: 'LayoutDashboard', sort_order: 1 },
  { id: 2, path: '/student/courses', label: 'Courses', role: 'student', icon: 'BookOpen', sort_order: 2 },
  { id: 3, path: '/student/timetable', label: 'Timetable', role: 'student', icon: 'Calendar', sort_order: 3 },
  { id: 4, path: '/student/assignments', label: 'Assignments', role: 'student', icon: 'Briefcase', sort_order: 4 },
  { id: 5, path: '/student/study-groups', label: 'Study Groups', role: 'student', icon: 'Users', sort_order: 5 },
  { id: 6, path: '/student/marketplace', label: 'Marketplace', role: 'student', icon: 'ShoppingBag', sort_order: 6 },
  { id: 7, path: '/student/food-order', label: 'Food Order', role: 'student', icon: 'Utensils', sort_order: 7 },
  { id: 8, path: '/student/laundry', label: 'Laundry', role: 'student', icon: 'Truck', sort_order: 8 },
  { id: 9, path: '/student/trips', label: 'Trips', role: 'student', icon: 'MapPin', sort_order: 9 },
  { id: 42, path: '/student/rides', label: 'Rides', role: 'student', icon: 'Car', sort_order: 10 },
  // Lecturer (10–14)
  { id: 10, path: '/lecturer/dashboard', label: 'Dashboard', role: 'lecturer', icon: 'LayoutDashboard', sort_order: 1 },
  { id: 11, path: '/lecturer/courses', label: 'My Courses', role: 'lecturer', icon: 'BookOpen', sort_order: 2 },
  { id: 12, path: '/lecturer/schedule', label: 'Schedule', role: 'lecturer', icon: 'Calendar', sort_order: 3 },
  { id: 13, path: '/lecturer/students', label: 'Students', role: 'lecturer', icon: 'Users', sort_order: 4 },
  { id: 14, path: '/lecturer/assignments', label: 'Assignments', role: 'lecturer', icon: 'Briefcase', sort_order: 5 },
  // Admin (15–20)
  { id: 15, path: '/admin/dashboard', label: 'Dashboard', role: 'admin', icon: 'LayoutDashboard', sort_order: 1 },
  { id: 16, path: '/admin/users', label: 'Users', role: 'admin', icon: 'Users', sort_order: 2 },
  { id: 17, path: '/admin/timetable', label: 'Timetable', role: 'admin', icon: 'Calendar', sort_order: 3 },
  { id: 18, path: '/admin/reports', label: 'Reports', role: 'admin', icon: 'BarChart3', sort_order: 4 },
  { id: 19, path: '/admin/announcements', label: 'Announcements', role: 'admin', icon: 'Bell', sort_order: 5 },
  // Vendor-food (food stalls only — no laundry)
  { id: 20, path: '/vendor/dashboard', label: 'Dashboard', role: 'vendor-food', icon: 'LayoutDashboard', sort_order: 1 },
  { id: 21, path: '/vendor/orders', label: 'Orders', role: 'vendor-food', icon: 'Package', sort_order: 2 },
  { id: 23, path: '/vendor/products', label: 'Products', role: 'vendor-food', icon: 'Utensils', sort_order: 4 },
  { id: 24, path: '/vendor/my-store', label: 'My Store', role: 'vendor-food', icon: 'Store', sort_order: 5 },
  { id: 25, path: '/vendor/sales-analytics', label: 'Sales & Analysis', role: 'vendor-food', icon: 'BarChart3', sort_order: 6 },
  // Vendor-laundry (laundry-specific pages; dashboard/products/store/sales shared via role_page_permissions)
  { id: 22, path: '/vendor/laundry/orders', label: 'Laundry Orders', role: 'vendor-laundry', icon: 'Truck', sort_order: 2 },
  { id: 41, path: '/vendor/fulfillment', label: 'Fulfillment', role: 'vendor-laundry', icon: 'Truck', sort_order: 3 },
  // Delivery (26–29)
  { id: 26, path: '/delivery/dashboard', label: 'Dashboard', role: 'delivery', icon: 'LayoutDashboard', sort_order: 1 },
  { id: 27, path: '/delivery/active', label: 'Food Deliveries', role: 'delivery', icon: 'Package', sort_order: 2 },
  { id: 28, path: '/delivery/laundry', label: 'Laundry Jobs', role: 'delivery', icon: 'Truck', sort_order: 3 },
  { id: 29, path: '/delivery/earnings', label: 'Earnings', role: 'delivery', icon: 'BarChart3', sort_order: 4 },
  // Super Admin (30–35)
  { id: 30, path: '/super-admin/dashboard', label: 'Dashboard', role: 'super_admin', icon: 'LayoutDashboard', sort_order: 1 },
  { id: 31, path: '/super-admin/users', label: 'All Users', role: 'super_admin', icon: 'UserCog', sort_order: 2 },
  { id: 32, path: '/super-admin/roles', label: 'Roles & Permissions', role: 'super_admin', icon: 'Shield', sort_order: 3 },
  { id: 33, path: '/super-admin/analytics', label: 'System Analytics', role: 'super_admin', icon: 'BarChart3', sort_order: 4 },
  { id: 34, path: '/super-admin/settings', label: 'Settings', role: 'super_admin', icon: 'Settings', sort_order: 5 },
  { id: 35, path: '/super-admin/pages', label: 'Page Management', role: 'super_admin', icon: 'LayoutList', sort_order: 6 },
  // Admin management (36–41)
  { id: 36, path: '/admin/laundry/add', label: 'Add Laundry Shop', role: 'admin', icon: 'Truck', sort_order: 6 },
  { id: 37, path: '/admin/food-stalls/add', label: 'Add Food Stall', role: 'admin', icon: 'Utensils', sort_order: 7 },
  { id: 38, path: '/admin/timetable/add', label: 'Add Timetable', role: 'admin', icon: 'Calendar', sort_order: 8 },
  { id: 39, path: '/admin/trips/add', label: 'Add Trip Location', role: 'admin', icon: 'MapPin', sort_order: 9 },
  { id: 40, path: '/admin/users/new', label: 'Add User', role: 'super_admin', icon: 'UserPlus', sort_order: 10 },
]

/** Default nav items per role (when DB has no permissions yet). vendor-laundry also gets shared vendor pages (dashboard, products, etc) excluding food Orders. */
const VENDOR_LAUNDRY_IDS = [20, 22, 41, 23, 24, 25]
const VENDOR_FOOD_IDS = [20, 21, 23, 24, 25]

export function getDefaultNavItemsForRole(role: UserRole): { label: string; href: string; icon: string }[] {
  const items = PAGE_REGISTRY.filter((p) => {
    if (role === 'super_admin' && p.role === 'admin') return true
    if (role === 'vendor-food') return VENDOR_FOOD_IDS.includes(p.id)
    if (role === 'vendor-laundry') return VENDOR_LAUNDRY_IDS.includes(p.id)
    return p.role === role
  }).sort((a, b) => {
    if (role === 'super_admin') {
      const aFirst = a.role === 'super_admin' ? 0 : 1
      const bFirst = b.role === 'super_admin' ? 0 : 1
      if (aFirst !== bFirst) return aFirst - bFirst
      return a.sort_order - b.sort_order
    }
    if (role === 'vendor-laundry') {
      const ai = VENDOR_LAUNDRY_IDS.indexOf(a.id)
      const bi = VENDOR_LAUNDRY_IDS.indexOf(b.id)
      return (ai >= 0 ? ai : 999) - (bi >= 0 ? bi : 999)
    }
    if (role === 'vendor-food') {
      const ai = VENDOR_FOOD_IDS.indexOf(a.id)
      const bi = VENDOR_FOOD_IDS.indexOf(b.id)
      return (ai >= 0 ? ai : 999) - (bi >= 0 ? bi : 999)
    }
    return a.role.localeCompare(b.role) || a.sort_order - b.sort_order
  })
  return items.map((p) => ({ label: p.label, href: p.path, icon: p.icon }))
}

/** All pages for a given role from registry (for super_admin: all pages from all roles). vendor-food and vendor-laundry each get their own pages. */
export function getAllPagesForRole(role: UserRole): PageRecord[] {
  if (role === 'super_admin') {
    return [...PAGE_REGISTRY].sort((a, b) => a.role.localeCompare(b.role) || a.sort_order - b.sort_order)
  }
  return PAGE_REGISTRY.filter((p) => p.role === role).sort((a, b) => a.sort_order - b.sort_order)
}

export const ROLES: UserRole[] = ['student', 'lecturer', 'admin', 'vendor-food', 'vendor-laundry', 'delivery', 'super_admin']
