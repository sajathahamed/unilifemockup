import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function check() {
  console.log('Fetching student_timetable_entries...')
  const { data, error } = await supabase
    .from('student_timetable_entries')
    .select('*')
  
  if (error) {
    console.error('Error:', error.message)
  } else {
    console.log(`Found ${data.length} entries.`)
    data.forEach(row => {
      console.log(`- ${row.day_of_week} ${row.start_time}: ${row.subject} (${row.entry_type})`)
    })
  }
}

check()
