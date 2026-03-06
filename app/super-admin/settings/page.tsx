import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SuperAdminPageHeader from '@/components/super-admin/SuperAdminPageHeader'
import SettingsForm from '@/components/super-admin/SettingsForm'

export default async function SuperAdminSettingsPage() {
  const user = await requireRole('super_admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <SuperAdminPageHeader
          title="Settings"
          subtitle="Configure application name, support email, registration, session timeout, and maintenance mode."
        />
        <SettingsForm />
      </div>
    </DashboardLayout>
  )
}
