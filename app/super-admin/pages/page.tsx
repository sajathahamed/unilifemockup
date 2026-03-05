import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { PageManagementClient } from './PageManagementClient'
import { ROLES } from '@/lib/pages/registry'

export default async function SuperAdminPagesPage() {
  const user = await requireRole('super_admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Page Management</h1>
          <p className="mt-1 text-red-100">
            Enable or disable sidebar pages per role. Students, lecturers, vendors, delivery, and admins only see pages for their role.
          </p>
        </div>

        <PageManagementClient roles={ROLES} />
      </div>
    </DashboardLayout>
  )
}
