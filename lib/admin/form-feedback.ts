/** Readable error string from admin API JSON responses */
export function apiErrorMessage(data: unknown, res: Response): string {
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    if (typeof o.message === 'string' && o.message.trim()) return o.message
    if (typeof o.error === 'string' && o.error.trim()) return o.error
  }
  if (res.status >= 500) return 'Server error — try again.'
  return `Could not save (${res.status}).`
}
