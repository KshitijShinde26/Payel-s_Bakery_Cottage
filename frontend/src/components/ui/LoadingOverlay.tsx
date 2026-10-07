import React from 'react'
import { Spinner } from './Spinner'
import { motion, AnimatePresence } from 'framer-motion'

export interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading Payal\'s Bakery...'
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center space-y-4 p-6 bg-white border border-amber-100 rounded-xl shadow-lg shadow-amber-900/5 max-w-xs text-center">
            <Spinner size="lg" />
            {message && (
              <p className="text-sm font-medium text-stone-700 font-serif leading-relaxed animate-pulse">
                {message}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
