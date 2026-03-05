import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminAnalyticsPage() {
  const user = await requireRole('super_admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">System Analytics</h1>
          <p className="mt-1 text-red-100">Usage and performance analytics.</p>
        </div>
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Coming soon</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Charts and reports for traffic, API usage, and role activity will appear here.
          </p>
          <Link
            href="/super-admin/dashboard"
            className="inline-flex items-center rounded-xl bg-primary text-white px-4 py-2 font-medium hover:bg-primary/90"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
