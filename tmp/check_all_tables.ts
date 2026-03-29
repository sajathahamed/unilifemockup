import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function check() {
  const tables = ['timetable_uploads', 'student_timetable_entries', 'timetable_notifications']
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(1)
    if (error) {
      console.log(`TABLE ${t}: MISSING (${error.message})`)
    } else {
      console.log(`TABLE ${t}: OK`)
    }
  }
}

check()
