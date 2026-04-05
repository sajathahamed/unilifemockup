import { Truck } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-primary/40 animate-spin"
            style={{ margin: '-0.5rem' }}
          />
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Truck size={28} className="text-primary" />
          </div>
        </div>
        <p className="text-gray-600 text-sm">Loading delivery…</p>
      </div>
    </div>
  )
}
