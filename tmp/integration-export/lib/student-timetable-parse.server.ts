/**
 * Heuristic extraction of timetable slots from plain text (e.g. PDF text layer).
 * Server-only.
 */

export type TimetableEntryType = 'class' | 'exam'

export interface ParsedSlot {
  day_of_week: string
  start_time: string
  end_time: string
  subject: string
  location: string
  entry_type: TimetableEntryType
}

const VALID_DAYS = new Set([
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
])

const DAY_PATTERN =
  /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/gi

const TIME_RANGE = /(\d{1,2}:\d{2})\s*(?:[-–—]|to)\s*(\d{1,2}:\d{2})/i

const DAY_MAP: Record<string, string> = {
  mon: 'Monday',
  monday: 'Monday',
  tue: 'Tuesday',
  tuesday: 'Tuesday',
  wed: 'Wednesday',
  wednesday: 'Wednesday',
  thu: 'Thursday',
  thursday: 'Thursday',
  fri: 'Friday',
  friday: 'Friday',
  sat: 'Saturday',
  saturday: 'Saturday',
  sun: 'Sunday',
  sunday: 'Sunday',
}

function normalizeDayToken(raw: string): string {
  const k = raw.trim().toLowerCase()
  return DAY_MAP[k] || raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

function padTime(t: string): string {
  if (!t) return '00:00:00'
  const cleaned = t.replace('.', ':')
  const parts = cleaned.split(':').map((x) => parseInt(x, 10))
  const h = parts[0] || 0
  const m = parts[1] || 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
}

function timeToMinutes(t: string): number {
  const parts = String(t).split(':').map((x) => parseInt(x, 10))
  const h = parts[0] || 0
  const m = parts[1] || 0
  return h * 60 + m
}

/** Drop invalid / hallucinated rows so only plausible timetable lines are stored. */
export function validateParsedSlots(slots: ParsedSlot[]): ParsedSlot[] {
  const seen = new Set<string>()
  const out: ParsedSlot[] = []
  for (const s of slots) {
    const day = normalizeDayToken(s.day_of_week || '')
    if (!VALID_DAYS.has(day)) continue
    const subj = (s.subject || '').trim()
    if (subj.length < 2 || subj.length > 400) continue
    const startM = timeToMinutes(s.start_time)
    const endM = timeToMinutes(s.end_time)
    if (endM <= startM || startM < 0 || endM > 24 * 60) continue
    const key = `${day}|${s.start_time}|${s.end_time}|${subj.slice(0, 120)}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({
      ...s,
      day_of_week: day,
      subject: subj.slice(0, 300),
      location: (s.location || '').trim().slice(0, 200),
      entry_type: s.entry_type === 'exam' ? 'exam' : 'class',
    })
  }
  return out
}

/** Pull slots from noisy PDF text: lines mentioning a weekday + time range + remainder as subject. */
export function parseTimetableFromText(text: string, entryType: TimetableEntryType = 'class'): ParsedSlot[] {
  if (!text || !text.trim()) return []
  const lines = text.split(/\r?\n/).map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean)
  const out: ParsedSlot[] = []
  const seen = new Set<string>()

  for (const line of lines) {
    const dayMatch = line.match(DAY_PATTERN)
    const timeMatch = line.match(TIME_RANGE)
    if (!dayMatch || !timeMatch) continue

    const day = normalizeDayToken(dayMatch[0])
    const start = padTime(timeMatch[1])
    const end = padTime(timeMatch[2])

    let subject = line
      .replace(DAY_PATTERN, '')
      .replace(TIME_RANGE, '')
      .replace(/^[|,\s\-–—]+/, '')
      .trim()
    if (subject.length < 2) subject = entryType === 'exam' ? 'Exam' : 'Class'

    const key = `${day}|${start}|${end}|${subject.slice(0, 80)}`
    if (seen.has(key)) continue
    seen.add(key)

    out.push({
      day_of_week: day,
      start_time: start,
      end_time: end,
      subject: subject.slice(0, 200),
      location: '',
      entry_type: entryType,
    })
  }

  return out
}

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    // @ts-ignore: pdf-parse lacks proper exports in some environments
    const pdfParse = (await import('pdf-parse')).default
    const res = await pdfParse(buffer)
    return (res.text || '').trim()
  } catch (e) {
    console.error('pdf-parse failed:', e)
    return ''
  }
}

/**
 * Uses Gemini to extract timetable rows from an image (vision) or PDF (native file).
 * `expectedEntryType` comes from the uploader (regular weekly vs exam); all rows are tagged accordingly.
 */
export async function parseTimetableWithAI(
  buffer: Buffer,
  mimeType: string,
  expectedEntryType: TimetableEntryType
): Promise<ParsedSlot[]> {
  try {
    const { google } = await import('@ai-sdk/google')
    const { generateText } = await import('ai')

    const isImage = mimeType.startsWith('image/')
    const isPdf = mimeType === 'application/pdf'

    const kindLabel =
      expectedEntryType === 'exam'
        ? 'EXAM timetable (assessments, final papers, midterms, tests).'
        : 'REGULAR WEEKLY CLASS timetable (lectures, labs, tutorials only — not exams).'

    const prompt = `You are extracting rows from a university ${kindLabel}

Rules:
- Extract ONLY sessions that are clearly printed in the file. Do NOT invent or guess rows.
- If the document is unreadable, blank, or not a timetable, return exactly: []
- Each row: one recurring weekly slot (use the day column / grid), or map a calendar date to the correct day-of-week for year 2026.
- Times: 24-hour HH:MM. Convert 9.30am / 12.45 style to HH:MM.
- subject: module or paper name as shown (concise).
- location: room, hall, or venue if visible; else "".
- Include every distinct session you can read; merge duplicates with identical day, time, and subject.

Output ONLY a JSON array (no markdown) of objects:
{"day_of_week":"Monday","start_time":"09:00","end_time":"10:00","subject":"...","location":"..."}

day_of_week must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.`

    const content: Array<
      | { type: 'text'; text: string }
      | { type: 'image'; image: string; mimeType?: string }
      | { type: 'file'; data: Buffer; mediaType: string }
    > = [{ type: 'text', text: prompt }]

    if (isImage) {
      content.push({
        type: 'image',
        image: buffer.toString('base64'),
        mimeType: mimeType,
      })
    } else if (isPdf) {
      content.push({
        type: 'file',
        data: buffer,
        mediaType: 'application/pdf',
      })
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    })

    const jsonStr = text.match(/\[[\s\S]*\]/)?.[0] || '[]'
    let slots: unknown[]
    try {
      slots = JSON.parse(jsonStr) as unknown[]
    } catch {
      return []
    }

    if (!Array.isArray(slots)) return []

    const raw: ParsedSlot[] = slots.map((s: unknown) => {
      const row = s as Record<string, unknown>
      const day = normalizeDayToken(String(row.day_of_week ?? 'Monday'))
      const start = String(row.start_time ?? '09:00').replace('.', ':')
      const end = String(row.end_time ?? '10:00').replace('.', ':')
      return {
        day_of_week: day,
        start_time: padTime(start),
        end_time: padTime(end),
        subject: String(row.subject ?? (expectedEntryType === 'exam' ? 'Exam' : 'Class')).trim(),
        location: String(row.location ?? '').trim(),
        entry_type: expectedEntryType,
      }
    })

    return validateParsedSlots(raw)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Gemini OCR failed:', e)
    throw new Error(
      `${msg} (Try a clearer photo, text-based PDF, or screenshot of the timetable grid.)`
    )
  }
}
