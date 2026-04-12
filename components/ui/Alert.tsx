'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  message: string
  onClose?: () => void
}

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: typeof CheckCircle }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: Info,
  },
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const styles = alertStyles[type]
  const Icon = styles.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        ${styles.bg} ${styles.border}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.text}`} />
      <p className={`text-sm flex-1 ${styles.text}`}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 transition-opacity`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  )
}