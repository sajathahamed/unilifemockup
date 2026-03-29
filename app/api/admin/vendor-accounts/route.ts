import { NextResponse } from 'next/server'
import { verifyRole } from '@/lib/auth.server'
import { fetchVendorAccountsForAdmin } from '@/lib/supabase/admin'

/** GET /api/admin/vendor-accounts — all vendor users for stall/shop assignment */
export async function GET() {
  try {
    const user = await verifyRole('admin')
    if (!user) return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const food = await fetchVendorAccountsForAdmin('vendor-food')
    const laundry = await fetchVendorAccountsForAdmin('vendor-laundry')
    const dedup = new Map<string, { id: number; name: string; email: string }>()
    ;[...food, ...laundry].forEach((acc) => dedup.set(acc.email.toLowerCase(), acc))
    const accounts = Array.from(dedup.values()).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    return NextResponse.json({ accounts })
  } catch (e) {
    console.error('Admin vendor-accounts GET error:', e)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
