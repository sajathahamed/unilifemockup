import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Utensils, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function StudentFoodOrderPage() {
  const user = await requireRole('student')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <Link href="/student/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> Back to dashboard
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Order</h1>
          <p className="text-gray-500 text-sm mt-0.5">Order food from campus vendors</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Coming soon</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Order food from campus canteens and vendors. This section can be extended later.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
