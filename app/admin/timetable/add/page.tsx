import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AdminTimetableAddForm from './AdminTimetableAddForm'
import Link from 'next/link'

export default async function AdminTimetableAddPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Add Timetable</h1>
          <p className="mt-1 text-emerald-100">Create timetable entries. Same data as student timetable view.</p>
        </div>
        <AdminTimetableAddForm />
        <div className="flex justify-center">
          <Link href="/admin/dashboard" className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
