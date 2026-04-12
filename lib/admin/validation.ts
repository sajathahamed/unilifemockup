/** Shared admin form validation (email, phone, lengths, numbers, dates). */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(s: string): boolean {
  return EMAIL_RE.test(String(s || '').trim())
}

/** Strip non-digits and cap length (for controlled phone inputs). */
export function digitsOnlyPhone(value: string, maxLen = 10): string {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, maxLen)
}

/** Exactly 10 digits required. */
export function validatePhone10Required(value: string, label: string): string | null {
  const d = digitsOnlyPhone(value, 10)
  if (d.length !== 10) return `${label} must be exactly 10 digits.`
  return null
}

/** Empty allowed; if any digit present, must be exactly 10. */
export function validatePhone10Optional(value: string, label: string): string | null {
  const d = digitsOnlyPhone(value, 10)
  if (d.length === 0) return null
  if (d.length !== 10) return `${label} must be exactly 10 digits or cleared.`
  return null
}

export function requireMinLen10(value: string, label: string): string | null {
  const t = String(value || '').trim()
  if (t.length < 10) return `${label} must be at least 10 characters.`
  return null
}

/** If user typed something, it must be at least 10 chars; empty is OK. */
export function minLen10IfPresent(value: string, label: string): string | null {
  const t = String(value || '').trim()
  if (t.length === 0) return null
  if (t.length < 10) return `${label} must be at least 10 characters (or leave empty).`
  return null
}

export function validatePositiveNumber(value: string, label: string, required: boolean): string | null {
  const t = String(value || '').trim()
  if (!t) return required ? `${label} is required.` : null
  const n = Number(t)
  if (Number.isNaN(n) || n <= 0) return `${label} must be a number greater than 0.`
  return null
}

export function validatePositiveInt(value: string, label: string, required: boolean): string | null {
  const t = String(value || '').trim()
  if (!t) return required ? `${label} is required.` : null
  if (!/^\d+$/.test(t)) return `${label} must be a positive whole number.`
  const n = parseInt(t, 10)
  if (n <= 0) return `${label} must be greater than 0.`
  return null
}

export function localTodayISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function validateDateNotPast(dateStr: string, label: string): string | null {
  const t = String(dateStr || '').trim()
  if (!t) return null
  const today = localTodayISODate()
  if (t < today) return `${label} cannot be in the past.`
  return null
}

export function validateReturnOnOrAfterDeparture(departure: string, returnDate: string): string | null {
  const d1 = String(departure || '').trim()
  const d2 = String(returnDate || '').trim()
  if (!d1 || !d2) return null
  if (d2 < d1) return 'Return date must be on or after departure date.'
  return null
}
