import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getLecturerDashboardData } from '@/lib/lecturer/dashboard.server'
import { Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function LecturerStudentsPage() {
  const user = await requireRole('lecturer')
  const { students } = await getLecturerDashboardData()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/lecturer/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-500 text-sm">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No students found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {students.map((s) => (
                <li key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
