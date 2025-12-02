import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BlurContainerProps {
  children: React.ReactNode
  blurText?: string
  blurUndertext?: string
  isBlurred?: boolean
  onToggleBlur?: (isBlurred: boolean) => void
  dissmissable?: boolean
}

export default function BlurContainer({
  children,
  blurText,
  blurUndertext,
  isBlurred = false,
  onToggleBlur,
  dissmissable = false,
}: BlurContainerProps) {
  const [localIsBlurred, setLocalIsBlurred] = useState(isBlurred)

  const toggleBlur = () => {
    const newBlurState = !localIsBlurred
    setLocalIsBlurred(newBlurState)
    onToggleBlur?.(newBlurState)
  }

  return (
    <div className="relative overflow-hidden">
      <motion.div
        animate={{ filter: localIsBlurred ? 'blur(10px)' : 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
      <AnimatePresence>
        {localIsBlurred && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center"
            onClick={() => dissmissable && toggleBlur()}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{blurText}</h2>
              <p className="text-sm text-white">{blurUndertext}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}