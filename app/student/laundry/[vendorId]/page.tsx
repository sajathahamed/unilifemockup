import { requireRole } from '@/lib/auth.server'
import LaundryDetailClient from '@/app/student/laundry/[vendorId]/LaundryDetailClient'
import { notFound } from 'next/navigation'

export const metadata = {
    title: 'Vendor Details | Laundry',
}

export default async function VendorDetailPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const user = await requireRole('student')
    const { vendorId } = await params
    return <LaundryDetailClient user={user} vendorId={vendorId ?? ''} />
}
