"use client"

import { useEffect, useRef } from 'react'

export function SimpleMarqueeBar({ text: _text = "EARLY ACCESS // ", repeater = 20 }: Readonly<{ text?: string, repeater?: number }>) {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const marquee = marqueeRef.current
    if (!marquee) return

    const content = marquee.firstElementChild as HTMLElement
    if (!content) return

    const animationDuration = 20 // Duration in seconds for one complete scroll
    const contentWidth = content.offsetWidth
    const animationName = `marquee-${Math.random().toString(36).substr(2, 9)}`

    const keyframes = `
      @keyframes ${animationName} {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${contentWidth / 2}px); }
      }
    `

    const styleSheet = document.createElement("style")
    styleSheet.textContent = keyframes
    document.head.appendChild(styleSheet)

    marquee.style.animation = `${animationName} ${animationDuration}s linear infinite`

    const resizeObserver = new ResizeObserver(() => {
      const newContentWidth = content.offsetWidth
      styleSheet.textContent = keyframes.replace(`-${contentWidth / 2}px`, `-${newContentWidth / 2}px`)
    })

    resizeObserver.observe(content)

    return () => {
      document.head.removeChild(styleSheet)
      resizeObserver.disconnect()
    }
  }, [])

  const earlyAccessText = _text.repeat(repeater)

  return (
    <div className="w-full bg-primary overflow-hidden py-2" aria-live="polite" aria-atomic="true">
      <div ref={marqueeRef} className="inline-block whitespace-nowrap">
        <div className="inline-block">
          <span className="text-primary-foreground font-semibold tracking-wider">{earlyAccessText}</span>
          <span className="text-primary-foreground font-semibold tracking-wider">{earlyAccessText}</span>
        </div>
      </div>
    </div>
  )
}