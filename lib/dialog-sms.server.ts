import crypto from 'crypto'

const DIALOG_SMS_URL = 'https://richcommunication.dialog.lk/api/sms/send'

/**
 * CREATED header — match PHP `date_default_timezone_set('Asia/Colombo'); date("Y-m-d\TH:i:s")`.
 * Dialog Rich Communication expects this format (no timezone suffix).
 */
export function formatDialogCreatedHeader(date = new Date()): string {
  const s = date.toLocaleString('sv-SE', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return s.replace(' ', 'T')
}

export type DialogSmsSendResult = {
  ok: boolean
  httpStatus: number
  body: unknown
  /** True when HTTP succeeded but parsed body suggests rejection / error (Dialog often returns 200 + errors in JSON). */
  gatewayReportedError: boolean
  /** Short explanation when gatewayReportedError */
  gatewayErrorHint: string | null
}

function detectDialogApplicationError(body: unknown): string | null {
  if (body == null) return null
  if (typeof body === 'string') {
    const t = body.trim()
    if (!t) return null
    const low = t.toLowerCase()
    if (low.includes('error') || low.includes('fail') || low.includes('invalid') || low.includes('reject')) {
      return t.length > 400 ? `${t.slice(0, 400)}…` : t
    }
    return null
  }
  if (typeof body !== 'object') return null
  const o = body as Record<string, unknown>

  const topDesc = o.resultDesc
  if (typeof topDesc === 'string' && topDesc.trim() && topDesc.toUpperCase() !== 'SUCCESS') {
    return topDesc.trim()
  }

  const pick = (v: unknown): string | null => {
    if (v == null) return null
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number' && v !== 0) return String(v)
    return null
  }

  for (const key of ['error', 'Error', 'errorMessage', 'message', 'description', 'statusText']) {
    const m = pick(o[key])
    if (m) {
      const low = m.toLowerCase()
      if (low.includes('fail') || low.includes('invalid') || low.includes('error') || low.includes('reject'))
        return m
    }
  }

  if (o.success === false) return pick(o.message) || 'success: false'
  if (o.status != null) {
    const st = String(o.status).toLowerCase()
    if (st === 'failed' || st === 'failure' || st === 'error') return pick(o.message) || `status: ${o.status}`
  }

  const results = o.results ?? o.messages ?? o.data
  if (Array.isArray(results)) {
    for (const item of results) {
      if (item && typeof item === 'object') {
        const r = item as Record<string, unknown>
        // Dialog Rich Communication: each item uses resultCode (0 = OK) + resultDesc
        const rc = r.resultCode
        if (typeof rc === 'number' && rc !== 0) {
          return (
            pick(r.resultDesc) ||
            pick(r.message) ||
            `Message rejected (resultCode ${rc})`
          )
        }
        if (typeof rc === 'string' && rc !== '0' && rc.toLowerCase() !== 'success') {
          return pick(r.resultDesc) || `resultCode: ${rc}`
        }
        const st = String(r.status ?? r.result ?? '').toLowerCase()
        if (st && st !== 'success' && st !== 'ok' && st !== '0' && st !== 'sent' && st !== 'queued') {
          return pick(r.message) || pick(r.error) || JSON.stringify(r).slice(0, 300)
        }
      }
    }
  }

  const nested = o.result
  if (nested && typeof nested === 'object') {
    const r = nested as Record<string, unknown>
    const code = r.code ?? r.statusCode
    if (code != null && String(code) !== '0' && String(code) !== '200' && String(code) !== 'SUCCESS') {
      return pick(r.message) || pick(r.description) || `code: ${code}`
    }
  }

  return null
}

/** Default Dialog sender mask (matches POS marketing `BMF`). */
export const DIALOG_SMS_DEFAULT_MASK = 'BMF'

/**
 * Sender ID / mask — same field as PHP `$vendor_row->mask`.
 * Uses first non-empty: DIALOG_SMS_MASK, DIALOG_MARKETING_MASK, DIALOG_POS_MASK — otherwise **BMF**.
 */
export function getDialogSmsMask(): string {
  for (const key of ['DIALOG_SMS_MASK', 'DIALOG_MARKETING_MASK', 'DIALOG_POS_MASK'] as const) {
    const t = process.env[key]?.trim()
    if (t) return t
  }
  return DIALOG_SMS_DEFAULT_MASK
}

/** PHP marketing: `"clientRef" => "RPOSbyUpview"` — override with DIALOG_SMS_CLIENT_REF */
export function getDialogDefaultClientRef(): string {
  return (process.env.DIALOG_SMS_CLIENT_REF?.trim() || 'RPOSbyUpview').trim()
}

/** PHP marketing: `"campaignName" => "restsaaspos"` — override with DIALOG_SMS_CAMPAIGN_NAME */
export function getDialogDefaultCampaignName(): string {
  return (process.env.DIALOG_SMS_CAMPAIGN_NAME?.trim() || 'restsaaspos').trim()
}

/**
 * Dialog Rich Communication SMS API — same wire format as PHP `Send_msg()` / Marketing/messages:
 * - POST https://richcommunication.dialog.lk/api/sms/send
 * - Headers: Content-Type, USER, DIGEST (md5 password), CREATED (Asia/Colombo Y-m-d\\TH:i:s)
 * - Body: `{ messages: [{ clientRef, number, mask, text, campaignName }] }`
 * - `number`: one MSISDN or comma-separated (PHP `implode(",", $mobile)`).
 *
 * Defaults (POS parity): clientRef RPOSbyUpview, campaignName restsaaspos, user Upview — override via env.
 * Pass `clientRef` / `campaignName` to override per call (e.g. timetable cron uses its own campaign).
 */
export async function sendDialogSms(opts: {
  number: string
  text: string
  /** Omit to use DIALOG_SMS_CLIENT_REF or `RPOSbyUpview` (POS marketing). */
  clientRef?: string
  /** Omit to use DIALOG_SMS_CAMPAIGN_NAME or `restsaaspos` (POS marketing). */
  campaignName?: string
  mask?: string
}): Promise<DialogSmsSendResult> {
  const mask = (opts.mask?.trim() || getDialogSmsMask()).trim() || DIALOG_SMS_DEFAULT_MASK

  const username = (process.env.DIALOG_SMS_USER || 'Upview').trim()
  const password = (process.env.DIALOG_SMS_PASSWORD || 'Upv!3w@321').trim()
  const digest = crypto.createHash('md5').update(password).digest('hex')
  const created = formatDialogCreatedHeader()

  const clientRef = opts.clientRef?.trim() || getDialogDefaultClientRef()
  const campaignName = opts.campaignName?.trim() || getDialogDefaultCampaignName()

  const smsRes = await fetch(DIALOG_SMS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      USER: username,
      DIGEST: digest,
      CREATED: created,
    },
    body: JSON.stringify({
      messages: [
        {
          clientRef,
          number: opts.number,
          mask,
          text: opts.text,
          campaignName,
        },
      ],
    }),
  })

  let body: unknown
  try {
    body = await smsRes.json()
  } catch {
    body = await smsRes.text()
  }

  const gatewayErrorHint = smsRes.ok ? detectDialogApplicationError(body) : null

  return {
    ok: smsRes.ok,
    httpStatus: smsRes.status,
    body,
    gatewayReportedError: Boolean(smsRes.ok && gatewayErrorHint),
    gatewayErrorHint,
  }
}
