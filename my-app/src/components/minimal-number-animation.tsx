"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Component({
  targetNumber = 1337,
  timeToReach = 2000,
  digits = 4
}: {
  targetNumber?: number,
  timeToReach?: number,
  digits?: number
}) {
  const [currentNumber, setCurrentNumber] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const incrementStep = (targetNumber - currentNumber) / (timeToReach / 50)

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime

      if (elapsedTime < timeToReach) {
        setCurrentNumber(prevNumber => {
          const newNumber = Math.min(
            prevNumber + incrementStep,
            targetNumber
          )
          return Math.floor(newNumber)
        })
      } else {
        setCurrentNumber(targetNumber)
        clearInterval(interval)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [targetNumber, timeToReach])

  const displayDigits = currentNumber.toString().padStart(digits, '0').split('').map(Number)

  return (
    <div className="flex justify-center items-center" role="timer" aria-live="polite">
      <div className="flex">
        {displayDigits.map((digit, index) => (
          <div key={index} className="w-10 h-16 overflow-hidden">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: -digit * 64 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <div key={n} className="h-16 flex items-center justify-center text-4xl font-mono">
                  {n}
                </div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}