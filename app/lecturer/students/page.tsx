import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import LecturerStudentsClient from '@/components/lecturer/LecturerStudentsClient'

export default async function LecturerStudentsPage() {
  const user = await requireRole('lecturer')

  return (
    <DashboardLayout user={user}>
      <LecturerStudentsClient />
    </DashboardLayout>
  )
}
