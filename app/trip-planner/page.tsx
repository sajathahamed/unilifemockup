import { getCurrentUser } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import TripPlannerClient from '@/components/trip-planner/TripPlannerClient'
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function TripPlannerPage() {
  const user = await getCurrentUser()

  const content = (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 text-white shadow-2xl shadow-slate-900/20">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-900/40 to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 shadow-sm shadow-white/5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-slate-200">
                  <MapPin size={16} />
                </span>
                Trip Planner
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Build a polished trip, faster.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Discover destinations, arrange attractions, and generate wise budget guidance in one modern planning flow.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200">AI itinerary</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200">Budget planning</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200">Save & revisit</span>
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/10 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:w-[26rem]">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="rounded-2xl bg-primary/15 p-3 text-primary">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="font-semibold text-white">Smart itinerary</p>
                  <p className="text-slate-300">Get a day-by-day agenda generated for your trip.</p>
                </div>
              </div>
              <div className="grid gap-3 rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <span>Trip duration</span>
                  <span className="font-semibold text-white">Flexible</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Budget breakdown</span>
                  <span className="font-semibold text-white">Instant</span>
                </div>
              </div>
            </div>
          </div>
          {user && (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={user.role === 'student' ? '/student/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-white/15"
              >
                <ArrowLeft size={20} />
                Back to dashboard
              </Link>
            </div>
          )}
        </div>
      </section>
      <TripPlannerClient />
    </div>
  )

  if (user) {
    return <DashboardLayout user={user}>{content}</DashboardLayout>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200">
              <MapPin size={18} className="text-white" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="font-display text-[15px] font-bold tracking-[-0.02em] text-slate-900 truncate">UniLife</p>
              <p className="text-xs text-slate-500 truncate">Trip Planner</p>
            </div>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Sign in to save
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-6">{content}</main>
    </div>
  )
}
