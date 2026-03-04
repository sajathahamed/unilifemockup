import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StudentAssignmentsClient from '@/components/student/StudentAssignmentsClient'

export default async function StudentAssignmentsPage() {
  const user = await requireRole('student')

  return (
    <DashboardLayout user={user}>
      <StudentAssignmentsClient />
    </DashboardLayout>
  )
}
