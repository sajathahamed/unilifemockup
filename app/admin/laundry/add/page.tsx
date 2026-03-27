import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AdminLaundryAddForm from './AdminLaundryAddForm'
import Link from 'next/link'

export default async function AdminLaundryAddPage() {
  const user = await requireRole('admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Add Laundry Shop</h1>
          <p className="mt-1 text-blue-100">Assign a shop to a laundry vendor account created in Super Admin.</p>
        </div>
        <AdminLaundryAddForm />
        <div className="flex justify-center">
          <Link href="/admin/dashboard" className="inline-flex items-center rounded-xl border border-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
