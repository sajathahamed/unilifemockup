import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { AdminPageHero, AdminPageStack, AdminBackToDashboard } from '@/components'
import AnnouncementsClient from './AnnouncementsClient'

export default async function AdminAnnouncementsPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <AdminPageStack>
        <AdminPageHero
          title="Announcements"
          subtitle="Campus-wide notices and updates for students and staff."
        />
        <AnnouncementsClient />
        <AdminBackToDashboard />
      </AdminPageStack>
    </DashboardLayout>
  )
}
