import { requireRole } from '@/lib/auth.server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getLecturerDashboardData } from '@/lib/lecturer/dashboard.server'
import { BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function LecturerCoursesPage() {
  const user = await requireRole('lecturer')
  const { courses } = await getLecturerDashboardData()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/lecturer/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-500 text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No courses found. Courses are managed by admin.</p>
            </div>
          ) : (
            courses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{c.course_name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{c.course_code}</p>
                  </div>
                  <Link
                    href="/lecturer/schedule"
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Schedule →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
