import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AssignmentsPageClient from '@/components/lecturer/AssignmentsPageClient'

export default async function LecturerAssignmentsPage() {
  const user = await requireRole('lecturer')

  return (
    <DashboardLayout user={user}>
      <AssignmentsPageClient />
    </DashboardLayout>
  )
}
