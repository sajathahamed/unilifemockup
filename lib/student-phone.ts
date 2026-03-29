/**
 * Shared phone helpers (client + server). Sri Lanka / Dialog-oriented; allows other intl lengths.
 */

/**
 * Normalize stored mobile for Dialog SMS (Sri Lanka–friendly).
 * Returns empty string if nothing usable.
 */
export function normalizeSmsPhoneNumber(raw: string | null | undefined): string {
  if (raw == null) return ''
  let d = String(raw).trim().replace(/[\s\-()]/g, '')
  if (!d) return ''
  if (d.startsWith('+')) d = d.slice(1)
  if (d.startsWith('0') && d.length >= 9) d = '94' + d.slice(1)
  if (/^\d{9}$/.test(d)) d = '94' + d
  return d
}

export type StudentPhoneValidation =
  | { ok: true; normalized: string }
  | { ok: false; message: string }

/**
 * Validates input for student profile / SMS. Returns normalized digits-only form when ok.
 */
export function validateStudentPhone(raw: string | null | undefined): StudentPhoneValidation {
  const trimmed = String(raw ?? '').trim()
  if (!trimmed) {
    return { ok: false, message: 'Mobile number is required.' }
  }

  const normalized = normalizeSmsPhoneNumber(trimmed)
  if (!normalized) {
    return {
      ok: false,
      message: 'Enter a valid number (e.g. 94771234567, +94 77 123 4567, or 0771234567).',
    }
  }

  if (!/^\d+$/.test(normalized)) {
    return { ok: false, message: 'Use digits only; spaces, +, and dashes are allowed while typing.' }
  }

  const len = normalized.length
  if (len < 10 || len > 15) {
    return {
      ok: false,
      message: 'Use 10–15 digits including country code (example: 94771234567 is 11 digits).',
    }
  }

  if (normalized.startsWith('94')) {
    if (len !== 11) {
      return {
        ok: false,
        message: 'Sri Lanka numbers with country code 94 must be 11 digits in total (e.g. 94771234567).',
      }
    }
    const national = normalized.slice(2)
    if (!/^[1-9]\d{8}$/.test(national)) {
      return {
        ok: false,
        message: 'Invalid Sri Lanka mobile: need 9 digits after 94, not starting with 0.',
      }
    }
  }

  return { ok: true, normalized }
}
