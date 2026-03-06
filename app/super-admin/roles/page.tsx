import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SuperAdminPageHeader from '@/components/super-admin/SuperAdminPageHeader'
import { ROLES, PAGE_REGISTRY } from '@/lib/pages/registry'
import type { UserRole } from '@/lib/auth'
import { Shield, LayoutList, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  student: 'Access to courses, timetable, study groups, marketplace, food order, laundry, and rides.',
  lecturer: 'Manage courses, schedule, students, and assignments.',
  admin: 'Campus management: users, timetable, reports, announcements. Can add laundry shops, food stalls, timetable, trips, and users.',
  vendor: 'Manage food and laundry orders, menu, store settings, and analytics.',
  delivery: 'View and complete food and laundry deliveries and earnings.',
  super_admin: 'Full system access: all users, roles, analytics, settings, and page permissions.',
}

export default async function SuperAdminRolesPage() {
  const user = await requireRole('super_admin')

  const roleInfo = ROLES.map((role) => {
    const pageCount = PAGE_REGISTRY.filter((p) => p.role === role).length
    return {
      role,
      label: role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      description: ROLE_DESCRIPTIONS[role],
      pageCount,
    }
  })

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SuperAdminPageHeader
            title="Roles & Permissions"
            subtitle="View role definitions and which pages each role can access. Enable or disable pages in Page Management."
          />
          <Link
            href="/super-admin/pages"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            <LayoutList size={18} />
            Page Management
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Shield className="text-gray-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Role overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 w-24 text-center">Pages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {roleInfo.map(({ role, label, description, pageCount }) => (
                  <tr key={role} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium ${getRoleBadgeClass(role)}`}>
                        <Users size={14} />
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{description}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-700">{pageCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <LayoutList className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-blue-900">Page visibility is controlled in Page Management</p>
            <p className="text-sm text-blue-700 mt-0.5">
              You can enable or disable sidebar pages per role and grant extra pages to specific users by email.
            </p>
            <Link href="/super-admin/pages" className="inline-block mt-2 text-sm font-medium text-blue-700 hover:text-blue-800 underline">
              Open Page Management →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-100 text-purple-800'
    case 'admin':
      return 'bg-blue-100 text-blue-800'
    case 'vendor':
      return 'bg-emerald-100 text-emerald-800'
    case 'delivery':
      return 'bg-orange-100 text-orange-800'
    case 'lecturer':
      return 'bg-indigo-100 text-indigo-800'
    case 'student':
      return 'bg-sky-100 text-sky-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
