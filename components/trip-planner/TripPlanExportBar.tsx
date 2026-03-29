'use client'

import { useState } from 'react'
import { Download, Share2, Link2, Check, Loader2 } from 'lucide-react'
import type { TripPlan } from './types'
import { downloadTripPlanPdf, tripPlanPdfBlob, tripPlanPdfFileName } from '@/lib/trip-plan-pdf'

export default function TripPlanExportBar({
  tripPlan,
  shareUrl,
}: {
  tripPlan: TripPlan
  /** Full URL to open this saved trip in UniLife (enables link copy / richer share). */
  shareUrl?: string | null
}) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const onDownload = () => {
    downloadTripPlanPdf(tripPlan)
  }

  const onShare = async () => {
    setBusy(true)
    try {
      const name = tripPlanPdfFileName(tripPlan)
      const blob = tripPlanPdfBlob(tripPlan)
      const file = new File([blob], name, { type: 'application/pdf' })
      const title = `Trip plan: ${tripPlan.destination}`
      const text = shareUrl?.trim()
        ? `Trip plan for ${tripPlan.destination}. View in UniLife: ${shareUrl.trim()}`
        : `Trip plan for ${tripPlan.destination} (UniLife)`

      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
            await navigator.share({ title, text, files: [file] })
            return
          }
        } catch {
          /* fall through */
        }
        if (shareUrl?.trim()) {
          await navigator.share({ title, text, url: shareUrl.trim() })
          return
        }
        try {
          await navigator.share({ title, text })
          return
        } catch {
          /* fall through */
        }
      }
      downloadTripPlanPdf(tripPlan)
    } catch (e) {
      const err = e as { name?: string }
      if (err.name !== 'AbortError') downloadTripPlanPdf(tripPlan)
    } finally {
      setBusy(false)
    }
  }

  const onCopyLink = async () => {
    const url = shareUrl?.trim()
    if (!url || typeof navigator === 'undefined' || !navigator.clipboard) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onDownload} className="btn-secondary !py-2 text-xs sm:text-sm inline-flex items-center gap-2">
        <Download size={16} strokeWidth={2.25} className="shrink-0" />
        Download PDF
      </button>
      <button
        type="button"
        onClick={onShare}
        disabled={busy}
        className="btn-secondary !py-2 text-xs sm:text-sm inline-flex items-center gap-2"
      >
        {busy ? <Loader2 size={16} className="shrink-0 animate-spin" /> : <Share2 size={16} strokeWidth={2.25} className="shrink-0" />}
        {busy ? 'Sharing…' : 'Share'}
      </button>
      {shareUrl?.trim() && (
        <button
          type="button"
          onClick={onCopyLink}
          className="btn-secondary !py-2 text-xs sm:text-sm inline-flex items-center gap-2"
        >
          {copied ? <Check size={16} strokeWidth={2.25} className="shrink-0 text-emerald-600" /> : <Link2 size={16} strokeWidth={2.25} className="shrink-0" />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      )}
    </div>
  )
}
