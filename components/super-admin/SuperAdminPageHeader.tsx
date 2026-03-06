import Link from 'next/link'
import { ArrowLeft, LucideIcon } from 'lucide-react'

interface SuperAdminPageHeaderProps {
  title: string
  subtitle: string
  /** Back link target; default /super-admin/dashboard */
  backHref?: string
  /** Optional right-side badge (e.g. count) */
  badge?: React.ReactNode
  /** Optional icon next to badge */
  icon?: LucideIcon
}

export default function SuperAdminPageHeader({
  title,
  subtitle,
  backHref = '/super-admin/dashboard',
  badge,
  icon: Icon,
}: SuperAdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          href={backHref}
          className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/20 transition-colors shrink-0"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      {badge != null && (
        <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-100 shrink-0">
          {Icon && <Icon size={20} className="text-gray-500" />}
          {badge}
        </div>
      )}
    </div>
  )
}
