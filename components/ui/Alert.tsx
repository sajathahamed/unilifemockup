'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

type AlertType = 'success' | 'error' | 'warning' | 'info'

interface AlertProps {
  type: AlertType
  message: string
  onClose?: () => void
}

const alertStyles: Record<AlertType, { bg: string; border: string; text: string; icon: typeof CheckCircle }> = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
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
        flex items-start gap-3 p-4 rounded-xl border
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
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  )
}
