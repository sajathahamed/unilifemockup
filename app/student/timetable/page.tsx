import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StudentTimetableClient from '@/components/student/StudentTimetableClient'

export default async function StudentTimetablePage() {
  const user = await requireRole('student')

  return (
    <DashboardLayout user={user}>
      <StudentTimetableClient />
    </DashboardLayout>
  )
}
