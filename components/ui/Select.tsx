'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, LucideIcon } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  icon?: LucideIcon
  options: SelectOption[]
  placeholder?: string
  helperText?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon: Icon, options, placeholder, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Icon size={18} />
            </div>
          )}
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 rounded-xl border bg-white appearance-none cursor-pointer
              transition-all duration-200 outline-none
              ${Icon ? 'pl-10' : ''}
              pr-10
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ChevronDown size={18} />
          </div>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
