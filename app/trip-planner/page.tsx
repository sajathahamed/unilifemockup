import { getCurrentUser } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import TripPlannerClient from '@/components/trip-planner/TripPlannerClient'
import { ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function TripPlannerPage() {
  const user = await getCurrentUser()

  const content = (
    <div className="space-y-8">
      <div className="page-hero flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-emerald-500/30">
              <MapPin size={24} strokeWidth={2.25} />
            </span>
            Trip Planner
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-xl leading-relaxed">
            Find attractions, build your itinerary, and get an AI budget breakdown — then save and revisit anytime.
          </p>
        </div>
        {user && (
          <Link
            href={user.role === 'student' ? '/student/dashboard' : '/dashboard'}
            className="btn-dashboard shrink-0 self-start sm:self-center inline-flex items-center gap-2"
          >
            <ArrowLeft size={22} strokeWidth={2.25} className="shrink-0" />
            Dashboard
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
