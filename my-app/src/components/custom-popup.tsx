import { useEffect, useRef } from 'react'

interface CustomPopupProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  position: { x: number; y: number }
}

export const CustomPopup: React.FC<CustomPopupProps> = ({ isOpen, onClose, children, position }) => {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className="fixed"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  )
}