'use client'

interface VendorSelectProps {
  vendors: { id: number; name: string; email: string }[]
  value: string
  onChange: (email: string) => void
  label?: string
  placeholder?: string
  className?: string
}

export default function VendorSelect({
  vendors,
  value,
  onChange,
  label = 'Vendor (email)',
  placeholder = 'Select vendor',
  className = '',
}: VendorSelectProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-gray-900"
      >
        <option value="">{placeholder}</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.email}>
            {v.name} ({v.email})
          </option>
        ))}
      </select>
    </div>
  )
}
