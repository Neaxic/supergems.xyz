"use client"

import React, { useState, useEffect, ReactNode, useMemo } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { useTheme } from 'next-themes'

interface GridProps {
  children: ReactNode[] | ReactNode
  initialColumns?: number
  fillers?: number
  maxHeight?: string
  parrentRef?: React.RefObject<HTMLDivElement>
  multiplyer?: number

}

export function ResponsiveGrid({ children, multiplyer = 1.5, initialColumns = 3, fillers, maxHeight, parrentRef }: GridProps) {
  const [columns, setColumns] = useState(initialColumns)
  const theme = useTheme();

  const handleResize = useMemo(() => {
    return () => {
      const width = parrentRef?.current?.clientWidth || window.innerWidth
      if (width < 640) setColumns(3 * multiplyer)
      else if (width < 768) setColumns(4 * multiplyer)
      else if (width < 1024) setColumns(5 * multiplyer)
      else setColumns(4 * multiplyer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parrentRef?.current?.clientWidth])


  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // useEffect(() => {
  //   handleResize()
  // }, [parrentRef?.current?.clientWidth])

  return (
    <ScrollArea className="w-full" style={{ height: maxHeight, overflow: 'hidden' }}>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridAutoRows: '1fr',
        }}
      >
        {children && Array.isArray(children) && children.length > 1 ? children.map((child, index) => (
          <div
            key={index}
            className="rounded-lg flex items-center justify-center aspect-square"
          >
            {child}
          </div>
        )) : children}
        {(fillers && (children && Array.isArray(children) && (children.length < fillers))) && Array.from({ length: fillers - children.length }).map((_, index) => (
          <div key={"filler" + index} className={`${theme.theme == "dark" ? "bg-zinc-950" : "bg-gray-200"} rounded-lg h-[235px]`} />
        ))}
      </div>
    </ScrollArea>
  )
}