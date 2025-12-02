'use client'

import React from 'react'

interface GridBackgroundProps {
  gridSize?: number
  gridColor?: string
  backgroundColor?: string
}

export function GridBackgroundComponent({
  gridSize = 20,
  gridColor = 'rgba(255,255,255,0.1)',
  backgroundColor = 'hsl(222.2 84% 4.9%)',
}: GridBackgroundProps = {}) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={gridColor}
              strokeWidth="0.5"
            />
          </pattern>
          <radialGradient id="fade" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={backgroundColor} stopOpacity="0" />
            <stop offset="80%" stopColor={backgroundColor} stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill={backgroundColor} />
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#fade)" />
      </svg>
    </div>
  )
}