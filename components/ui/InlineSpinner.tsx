import { Loader2 } from 'lucide-react'

type InlineSpinnerProps = {
  size?: number
  className?: string
}

export default function InlineSpinner({ size = 16, className = '' }: InlineSpinnerProps) {
  return <Loader2 size={size} className={`animate-spin ${className}`.trim()} />
}
