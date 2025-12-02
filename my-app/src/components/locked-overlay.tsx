import React from "react"

interface LockedOverlayProps {
    children?: React.ReactNode
    style?: React.CSSProperties
    title?: string
    subtitle?: string
    enabled: boolean
    textWrapper?: React.CSSProperties
}

export function LockedOverlay({
    children,
    textWrapper = {},
    title,
    enabled = true,
    subtitle,
    style,
}: LockedOverlayProps) {
    if (!enabled) return children

    return (
        <div
            className="absolute  w-full bg-repeat bg-opacity-20 dark:bg-opacity-20 bg-gradient-to-r from-red-100/10 to-red-200/20 dark:from-red-900/10 dark:to-red-800/20 backdrop-blur-md "
            style={{
                backgroundImage: "repeating-linear-gradient(45deg, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0.3) 10px, transparent 10px, transparent 20px)",
                ...style
            }}
        >
            <div
                className="flex flex-col items-center justify-center h-full"
                style={textWrapper}
            >
                {title && <h1 className="text-3xl font-bold">{title}</h1>}
                {subtitle && <p className="text-lg">{subtitle}</p>}
            </div>
            {children}
        </div>
    )
}