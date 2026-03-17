import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SuperAdminPageHeader from '@/components/super-admin/SuperAdminPageHeader'
import AnalyticsCharts from '@/components/super-admin/AnalyticsCharts'
import { fetchAllUsers } from '@/lib/supabase/admin'
import { ROLES } from '@/lib/pages/registry'

export default async function SuperAdminAnalyticsPage() {
  const user = await requireRole('super_admin')
  const users = await fetchAllUsers().catch(() => [])

  const roleCounts = ROLES.map((role) => ({
    role,
    count: users.filter((u) => u.role === role).length,
    label: role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
  }))

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.created_at,
    }))

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <SuperAdminPageHeader
          title="System Analytics"
          subtitle="User counts by role and recent signups. Data from the users table."
        />
        <AnalyticsCharts
          roleCounts={roleCounts}
          totalUsers={users.length}
          recentUsers={recentUsers}
        />
      </div>
    </DashboardLayout>
  )
}
