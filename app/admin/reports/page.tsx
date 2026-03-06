import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import Link from 'next/link'
import ReportsClient from './ReportsClient'

export default async function AdminReportsPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="mt-1 text-orange-100">Generate and view campus reports.</p>
        </div>

        <ReportsClient />

        <div className="flex justify-center">
          <Link href="/admin/dashboard" className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
