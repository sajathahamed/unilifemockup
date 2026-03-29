import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('Checking student_timetable_entries columns...')
  const { data, error } = await supabase
    .from('student_timetable_entries')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching entries:', error.message)
  } else {
    // Check if entry_type exists in the keys of the first row (if any)
    const row = data?.[0]
    if (row && 'entry_type' in row) {
      console.log('RESULT: ENTRY_TYPE_EXISTS')
    } else if (data && data.length > 0) {
      console.log('RESULT: ENTRY_TYPE_MISSING')
    } else {
      // If no data, we can try to insert a dummy row to test
      console.log('No data found, testing dummy insert...')
      const { error: insErr } = await supabase
        .from('student_timetable_entries')
        .insert({
           user_id: 1, // dummy
           day_of_week: 'Monday',
           start_time: '09:00:00',
           end_time: '10:00:00',
           subject: 'Test',
           entry_type: 'class'
        })
      
      if (insErr && insErr.message.includes('column "entry_type" of relation "student_timetable_entries" does not exist')) {
        console.log('RESULT: ENTRY_TYPE_MISSING')
      } else if (insErr) {
        console.log('RESULT: INSERT_FAILED', insErr.message)
      } else {
        console.log('RESULT: ENTRY_TYPE_EXISTS')
        // cleanup
        await supabase.from('student_timetable_entries').delete().eq('subject', 'Test')
      }
    }
  }
}

check()
