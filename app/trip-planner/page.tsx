import { getCurrentUser } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import TripPlannerClient from '@/components/trip-planner/TripPlannerClient'
import { MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function TripPlannerPage() {
  const user = await getCurrentUser()

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={28} className="text-primary" />
            Trip Planner
          </h1>
          <p className="text-gray-500 mt-1">
            Plan your trip: find attractions, build an itinerary, and estimate your budget.
          </p>
        </div>
        {user && (
          <Link
            href={user.role === 'student' ? '/student/dashboard' : '/dashboard'}
            className="text-sm text-primary hover:underline"
          >
            Back to dashboard
          </Link>
        )}
      </div>
      <TripPlannerClient />
    </div>
  )

  if (user) {
    return <DashboardLayout user={user}>{content}</DashboardLayout>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            UniLife
          </Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-primary">
            Sign in to save trips
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-6">{content}</main>
    </div>
  )
}
