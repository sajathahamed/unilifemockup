-- Add file upload columns to assignment_submissions for PDF/DOC attachments
-- After running this migration, create a Storage bucket in Supabase Dashboard:
--   Storage → New bucket → Name: assignment-submissions → Public: ON (so submission links work)
ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);

COMMENT ON COLUMN assignment_submissions.file_url IS 'Public URL of uploaded file (PDF/DOC) in storage';
COMMENT ON COLUMN assignment_submissions.file_name IS 'Original filename of uploaded file';
