import { getAdminClient } from '@/lib/supabase/admin'

export async function getPublicSettings() {
  const admin = getAdminClient()
  const keys = ['maintenance_message', 'maintenance_start_time', 'maintenance_end_time']
  
  const { data, error } = await admin
    .from('system_settings')
    .select('key, value')
    .in('key', keys)

  const settings = {
    maintenance_message: 'The system will be undergoing scheduled maintenance.',
    maintenance_start_time: '',
    maintenance_end_time: ''
  }

  if (!error && data) {
    data.forEach(row => {
      if (row.key in settings) {
        settings[row.key as keyof typeof settings] = row.value || ''
      }
    })
  }

  return settings
}
