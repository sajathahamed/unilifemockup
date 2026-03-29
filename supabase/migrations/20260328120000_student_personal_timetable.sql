-- Student personal timetable (upload + parsed rows) and reminder tracking.
-- Create storage bucket "timetable-uploads" in Supabase Dashboard → Storage (private).

CREATE TABLE IF NOT EXISTS timetable_uploads (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  parse_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_timetable_entries (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upload_id INT REFERENCES timetable_uploads(id) ON DELETE SET NULL,
  day_of_week TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timetable_notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_id INT REFERENCES student_timetable_entries(id) ON DELETE CASCADE,
  notify_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  channel TEXT NOT NULL DEFAULT 'in_app',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, entry_id, notify_at)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS timetable_reminder_minutes INT DEFAULT 15;

CREATE INDEX IF NOT EXISTS idx_stt_entries_user ON student_timetable_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_stt_uploads_user ON timetable_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_notifications_user ON timetable_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_timetable_notifications_status ON timetable_notifications(status, notify_at);
