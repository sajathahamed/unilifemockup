import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { AdminPageHero, AdminPageStack, AdminBackToDashboard } from '@/components'
import ReportsClient from './ReportsClient'

export default async function AdminReportsPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <AdminPageStack>
        <AdminPageHero
          title="Reports"
          subtitle="Generate and view campus reports. Export CSV for external analysis."
        />
        <ReportsClient />
        <AdminBackToDashboard />
      </AdminPageStack>
    </DashboardLayout>
  )
}
