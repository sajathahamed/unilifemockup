import { requireRole } from '@/lib/auth.server'
import LaundryDetailClient from '@/app/student/laundry/[vendorId]/LaundryDetailClient'
import { notFound } from 'next/navigation'

export const metadata = {
    title: 'Vendor Details | Laundry',
}

export default async function VendorDetailPage({ params }: { params: { vendorId: string } }) {
    const user = await requireRole('student')

    // In a real app, we'd fetch the vendor data from a DB here
    // For now, we'll let the client component handle the mock data or fetch it

    return <LaundryDetailClient user={user} vendorId={params.vendorId} />
}
