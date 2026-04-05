import { requireRole } from '@/lib/auth.server'
import VendorFulfillmentClient from './VendorFulfillmentClient'

export default async function VendorFulfillmentPage() {
  const user = await requireRole('vendor-laundry')
  return <VendorFulfillmentClient user={user} />
}
