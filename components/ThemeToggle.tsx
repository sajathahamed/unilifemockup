'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-glass border border-glassBorder flex items-center p-1 cursor-pointer transition-colors hover:border-primary/50"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        animate={{ x: theme === 'dark' ? 0 : 24 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #2ec118 0%, #5dd842 100%)' 
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
        }}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-white" />
        ) : (
          <Sun size={14} className="text-white" />
        )}
      </motion.div>
    </motion.button>
  )
}