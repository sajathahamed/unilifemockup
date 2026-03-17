import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StudentCoursesClient from '@/components/student/StudentCoursesClient'

export default async function StudentCoursesPage() {
  const user = await requireRole('student')

  return (
    <DashboardLayout user={user}>
      <StudentCoursesClient />
    </DashboardLayout>
  )
}
