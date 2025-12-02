"use client"

import { useEffect, useState, useRef } from "react"

interface ScrambledTextProps {
  text: string
  interval?: number
  loading?: boolean
}

export function ScrambledTextComponent({
  text,
  interval = 50,
  loading = false
}: ScrambledTextProps) {
  const [scrambledText, setScrambledText] = useState(text)
  const iterationRef = useRef(0)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined

    const scramble = () => {
      intervalId = setInterval(() => {
        setScrambledText(() =>
          text
            .split("")
            .map((letter, index) => {
              if (index < iterationRef.current) {
                return text[index]
              }
              return letters[Math.floor(Math.random() * 26)]
            })
            .join("")
        )

        if (iterationRef.current >= text.length && !loading) {
          iterationRef.current = 0
          clearInterval(intervalId)
        } else {
          iterationRef.current += 1 / 3
        }
      }, interval)
    }

    // Reset iteration when text changes or loading state changes
    iterationRef.current = 0

    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId)
    }

    // Start new scramble
    scramble()

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [text, interval, loading]) // Added loading to dependencies

  return <span>{scrambledText}</span>
}