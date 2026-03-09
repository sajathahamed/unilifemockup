import { requireRole } from '@/lib/auth.server'
import VendorLaundryOrdersClient from './VendorLaundryOrdersClient'

export default async function VendorLaundryOrdersPage() {
  const user = await requireRole('vendor-laundry')
  return <VendorLaundryOrdersClient user={user} />
}
