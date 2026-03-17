import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AdminTimetableView from '@/components/admin/AdminTimetableView'

export default async function AdminTimetablePage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <AdminTimetableView />
    </DashboardLayout>
  )
}
