'use client'

import { useState } from 'react'
import { Button, ButtonProps } from "@/components/ui/button"

export function GlamorousButton({ className, children, ...props }: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Button
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {children}
      </span>
      <span
        className={`absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 transition-transform duration-300 ease-in-out ${isHovered ? 'translate-x-full' : 'translate-x-0'
          }`}
      />
      <span
        className={`absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 transition-transform duration-300 ease-in-out ${isHovered ? 'translate-x-0' : '-translate-x-full'
          }`}
      />
      {/* <span
        className={`absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 transition-transform duration-300 ease-in-out ${isHovered ? 'translate-x-full' : 'translate-x-0'
          }`}
      />
      <span
        className={`absolute inset-0 bg-gradient-to-r from-lime-300 via-green-400 to-emerald-500 transition-transform duration-300 ease-in-out ${isHovered ? 'translate-x-0' : '-translate-x-full'
          }`}
      /> */}
    </Button>
  )
}