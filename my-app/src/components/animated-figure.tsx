'use client'

import React from 'react'
import CountUp from 'react-countup'

interface AnimatedFigureProps {
  value: number
  unit: string
  duration?: number
  decimals?: number
}

export function AnimatedFigureComponent({ value, unit, duration = 2, decimals = 0 }: AnimatedFigureProps) {
  return (
    <div className="flex items-baseline justify-center space-x-2 text-4xl font-bold">
      <CountUp
        end={value}
        duration={duration}
        decimals={decimals}
        decimal="."
        separator=","
        className="tabular-nums"
      />
      <span className="text-2xl font-medium text-muted-foreground">{unit}</span>
    </div>
  )
}