/**
 * Applies supabase/migrations/20260328120000_student_personal_timetable.sql
 *
 * Set DATABASE_URL in .env.local (Supabase → Settings → Database → Connection string → URI).
 */

const fs = require('fs')
const path = require('path')
const pg = require('pg')
const dotenv = require('dotenv')

const root = path.join(__dirname, '..')
dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config({ path: path.join(root, '.env') })

const url =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.DIRECT_URL

if (!url) {
  console.error(`
Missing DATABASE_URL (or SUPABASE_DB_URL / DIRECT_URL).

1. Supabase Dashboard → Project Settings → Database.
2. Copy the "URI" connection string (include password).
3. Add to .env.local:

   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

4. Run: npm run db:apply:student-timetable
`)
  process.exit(1)
}

const sqlPath = path.join(
  root,
  'supabase',
  'migrations',
  '20260328120000_student_personal_timetable.sql'
)
const sql = fs.readFileSync(sqlPath, 'utf8')

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes('localhost') ? false : { rejectUnauthorized: false },
})

;(async () => {
  await client.connect()
  try {
    await client.query(sql)
    console.log('Applied 20260328120000_student_personal_timetable.sql successfully.')
    console.log(
      'Next: create a private Storage bucket named "timetable-uploads" (Supabase → Storage).'
    )
  } catch (e) {
    console.error('Migration failed:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
})()
