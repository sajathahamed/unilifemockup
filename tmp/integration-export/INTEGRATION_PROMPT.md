# UniLife Module Integration Prompt (Student Profile + Timetable + Trip Planner)

Use this prompt in the target project repository:

---
You are integrating a feature pack from another Next.js (App Router + TypeScript) project.

## Goal
Integrate these modules exactly as provided, then adapt only where required by this repository:
1. Student Profile + SMS test
2. AI Timetable upload + reminders + cron dispatch
3. Trip Planner + AI budget + places + PDF export

## Source File Set
Copy all files from `tmp/integration-export/` into matching paths in this repository.
Preserve file names and route segment folders including `[id]`.

## Hard Requirements
- Keep API route behavior unchanged unless a compile/runtime error requires adaptation.
- Keep all request/response JSON shapes backward compatible with source behavior.
- Keep role checks (`requireRole`, `verifyRole`, `getCurrentUser`) intact.
- Keep SMS gateway integration using `sendDialogSms` and existing env variables.
- Keep timetable reminder message format exactly from `buildTimetableReminderMessage`.

## After Copy: Resolve Dependencies
1. Fix import aliases if this repo does not use `@/`.
2. Ensure these dependencies exist in `package.json`:
   - `@supabase/supabase-js`
   - `@supabase/ssr`
   - `@ai-sdk/google`
   - `ai`
   - `pdf-parse`
   - `jspdf`
   - `framer-motion`
   - `lucide-react`
3. Ensure environment variables are configured:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_MAPS_API_KEY`
   - `CRON_SECRET`
   - `DIALOG_SMS_USER`
   - `DIALOG_SMS_PASSWORD`
   - `DIALOG_SMS_MASK` (or `DIALOG_MARKETING_MASK` / `DIALOG_POS_MASK`)
   - `DIALOG_SMS_CLIENT_REF` (optional)
   - `DIALOG_SMS_CAMPAIGN_NAME` (optional)
   - Gemini key expected by AI SDK Google in this repo setup
4. Keep routes as server runtime where defined (`export const runtime = 'nodejs'`).

## Database / Storage Expectations
Confirm these tables and bucket (or map to equivalents):
- `student_phones`
- `student_timetable_entries`
- `timetable_uploads`
- `timetable_notifications`
- `trips`
- `trip_places`
- `users` (with `timetable_reminder_minutes`)
- Supabase storage bucket: `timetable-uploads` (private)

## Validation Checklist
- Typecheck/build passes.
- `/student/profile` saves phone and test SMS endpoint responds.
- Timetable upload works for image/PDF and creates entries.
- Reminder preview and cron endpoint process scheduled notifications.
- Trip planner search → attractions → budget → plan → save flow works.
- Saved trip edit by `/api/trip/[id]` works.

## Output Format
Provide:
1. Changed files list
2. Any adapted logic and why
3. Remaining TODOs (DB schema/env)
4. Exact commands to run for verify
---
