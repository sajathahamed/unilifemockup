import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SuperAdminPageHeader from '@/components/super-admin/SuperAdminPageHeader'
import { PageManagementClient } from './PageManagementClient'
import { ROLES } from '@/lib/pages/registry'

export default async function SuperAdminPagesPage() {
  const user = await requireRole('super_admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <SuperAdminPageHeader
          title="Page Management"
          subtitle="Enable or disable sidebar pages per role or per user. Changes apply immediately."
        />

        <PageManagementClient roles={ROLES} />
      </div>
    </DashboardLayout>
  )
}
