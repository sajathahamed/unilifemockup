import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import TripPlannerClient from '@/components/trip-planner/TripPlannerClient'
import { MapPin, Sparkles } from 'lucide-react'

export default async function StudentTripsPage() {
  const user = await requireRole('student')

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/50 to-blue-50 shadow-sm">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[140%] rounded-full bg-blue-100/50 blur-3xl -z-10" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/40 blur-3xl -z-10" />
          
          <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700 shadow-sm backdrop-blur-md">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <MapPin size={16} />
                  </span>
                  My Trips
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:leading-[1.1]">
                  Build a polished trip, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">faster.</span>
                </h1>
                <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                  Discover destinations, arrange attractions, and generate wise budget guidance in one modern planning flow.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">AI itinerary</span>
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">Budget planning</span>
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">Save & revisit</span>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/80 bg-white/60 p-6 shadow-xl shadow-indigo-100/50 backdrop-blur-xl sm:w-[26rem]">
                <div className="flex items-center gap-4 text-sm text-slate-700">
                  <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600 shadow-inner">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base">Smart itinerary</p>
                    <p className="text-slate-500">Get a day-by-day agenda generated for your trip.</p>
                  </div>
                </div>
                <div className="grid gap-3 rounded-[1.25rem] bg-slate-50/80 p-4 text-sm border border-slate-100">
                  <div className="flex items-center justify-between gap-3 text-slate-600">
                    <span className="font-medium">Trip duration</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded-md shadow-sm">Flexible</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-slate-600">
                    <span className="font-medium">Budget breakdown</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded-md shadow-sm">Instant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <TripPlannerClient />
      </div>
    </DashboardLayout>
  )
}