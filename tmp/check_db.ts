import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  console.log('Checking timetable_uploads table...')
  const { data, error } = await supabase
    .from('timetable_uploads')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching timetable_uploads:', error.message)
    if (error.message.includes('relation "timetable_uploads" does not exist')) {
        console.log('RESULT: TABLE_MISSING')
    } else {
        console.log('RESULT: ERROR', error)
    }
  } else {
    console.log('RESULT: TABLE_EXISTS')
  }
  
  console.log('Checking student_phones table...')
  const { error: phoneErr } = await supabase
    .from('student_phones')
    .select('*')
    .limit(1)
    
  if (phoneErr) {
    console.error('Error fetching student_phones:', phoneErr.message)
  } else {
    console.log('RESULT: STUDENT_PHONES_EXISTS')
  }
}

check()
