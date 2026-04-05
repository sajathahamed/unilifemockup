import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import LecturerAssignmentsClient from '@/components/lecturer/LecturerAssignmentsClient'
import { getLecturerCourses } from '@/lib/lecturer/courses.server'

export default async function LecturerAssignmentsPage() {
  const user = await requireRole('lecturer')
  const courses = await getLecturerCourses()

  return (
    <DashboardLayout user={user}>
      <LecturerAssignmentsClient initialCourses={courses} />
    </DashboardLayout>
  )
}
