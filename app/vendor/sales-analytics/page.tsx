import { requireRole } from '@/lib/auth.server'
import VendorSalesAnalyticsClient from './VendorSalesAnalyticsClient'

export default async function VendorSalesAnalyticsPage() {
  const user = await requireRole('vendor')
  return <VendorSalesAnalyticsClient user={user} />
}
