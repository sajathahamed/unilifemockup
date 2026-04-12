import Link from 'next/link'

/** Same hero treatment as admin dashboard for consistent admin UX. */
export function AdminPageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-6 text-white shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1.5 text-sm text-emerald-50/95 max-w-2xl leading-relaxed">{subtitle}</p>
    </div>
  )
}

export function AdminBackToDashboard() {
  return (
    <div className="flex justify-center pt-1">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

export function AdminPageStack({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 max-w-6xl mx-auto w-full min-w-0">{children}</div>
}
