'use client'

import { useState } from 'react'
import { Download, Share2, Check, Link as LinkIcon } from 'lucide-react'
import type { TripPlan } from './types'
import { downloadTripPlanPdf } from '@/lib/trip-plan-pdf'

export default function TripPlanExportBar({
  tripPlan,
  shareUrl,
}: {
  tripPlan: TripPlan
  shareUrl?: string | null
}) {
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    downloadTripPlanPdf(tripPlan)
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: do nothing
    }
  }

  const handleShare = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `Trip plan: ${tripPlan.destination}`,
          text: `Check out my trip plan to ${tripPlan.destination}!`,
          url: shareUrl ?? undefined,
        })
      } catch {
        // user cancelled or unsupported
      }
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Download size={16} />
        PDF
      </button>

      {shareUrl && (
        <>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <LinkIcon size={16} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
          )}
        </>
      )}
    </div>
  )
}
