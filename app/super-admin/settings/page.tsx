import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Settings } from 'lucide-react'

export default async function SuperAdminSettingsPage() {
  const user = await requireRole('super_admin')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="mt-1 text-red-100">Configure application and security settings.</p>
        </div>
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Coming soon</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            System-wide settings (branding, features, integrations) will be available here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
