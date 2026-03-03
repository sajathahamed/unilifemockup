import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import SchedulePageClient from '@/components/lecturer/SchedulePageClient'

export default async function SchedulePage() {
  const user = await requireRole('lecturer')

  return (
    <DashboardLayout user={user}>
      <SchedulePageClient />
    </DashboardLayout>
  )
}