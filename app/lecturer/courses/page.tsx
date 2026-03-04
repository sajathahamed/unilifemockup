import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import LecturerCoursesClient from '@/components/lecturer/LecturerCoursesClient'
import { getLecturerCourses } from '@/lib/lecturer/courses.server'

export default async function LecturerCoursesPage() {
  const user = await requireRole('lecturer')
  const initialCourses = await getLecturerCourses()

  return (
    <DashboardLayout user={user}>
      <LecturerCoursesClient initialCourses={initialCourses} />
    </DashboardLayout>
  )
}
