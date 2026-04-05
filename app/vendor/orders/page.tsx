import { requireRole } from '@/lib/auth.server'
import VendorOrdersClient from './VendorOrdersClient'

/** Vendor orders page: fetches logged-in user (by session/email) and passes to client */
export default async function VendorOrdersPage() {
  const user = await requireRole('vendor-food')
  return <VendorOrdersClient user={user} />
}
