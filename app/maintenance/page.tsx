import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center">
        <div className="p-8">
          <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Maintenance</h1>
          <p className="text-gray-600 mb-6">
            Sorry, the application is currently in maintenance mode. We are performing some scheduled updates to improve your experience. Please check back later.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-500 mb-8">
            The page will be updated soon Thank You.
          </div>
          <Link
            href="/login"
            className="inline-block w-full py-3 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
