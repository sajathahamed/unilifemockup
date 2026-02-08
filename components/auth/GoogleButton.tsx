'use client'

import { motion } from 'framer-motion'

interface GoogleButtonProps {
  onClick: () => void
  isLoading?: boolean
  text?: string
}

/**
 * Google Sign-In button following Google's brand guidelines
 */
export default function GoogleButton({ onClick, isLoading, text = 'Continue with Google' }: GoogleButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 
        border-2 border-gray-200 rounded-xl bg-white 
        hover:bg-gray-50 hover:border-gray-300
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        font-medium text-gray-700"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path
              fill="#4285F4"
              d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
            />
            <path
              fill="#34A853"
              d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
            />
            <path
              fill="#FBBC05"
              d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
            />
            <path
              fill="#EA4335"
              d="M -14.754 44.989 C -12.984 44.989 -11.404 45.599 -10.154 46.789 L -6.734 43.369 C -8.804 41.449 -11.514 40.239 -14.754 40.239 C -19.444 40.239 -23.494 42.939 -25.464 46.859 L -21.484 49.949 C -20.534 47.099 -17.884 44.989 -14.754 44.989 Z"
            />
          </g>
        </svg>
      )}
      <span>{isLoading ? 'Connecting...' : text}</span>
    </motion.button>
  )
}
