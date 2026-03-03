import { requireRole } from '@/lib/auth.server'
import LaundryClient from './LaundryClient'

export const metadata = {
    title: 'Laundry Services | UniLife',
    description: 'Find and order laundry services near your campus.',
}

export default async function LaundryPage() {
    const user = await requireRole('student')
    return <LaundryClient user={user} />
}
