"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export default function Component() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) return null

    return (
        <header className="sticky top-0 z-10 w-full py-6 px-6">
            <div className="max-w-6xl mx-auto flex items-center justify-center">
                <div className="bg-popover rounded-full shadow-sm flex items-center border border-border">
                    <Link href="/" className="flex items-center space-x-2 px-6 py-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                        <span className="font-bold text-xl">ICEBREAKER</span>
                    </Link>
                    <nav className="flex space-x-12 px-8">
                        <Link href="/switch" className="text-foreground/60 hover:text-foreground py-3">Switch</Link>
                        <Link href="/swap" className="text-foreground/60 hover:text-foreground py-3">Swap</Link>
                        <Link href="#blog" className="text-foreground/60 hover:text-foreground py-3">Market</Link>
                        <Link href="#company" className="text-foreground/60 hover:text-foreground py-3">Valut</Link>
                    </nav>
                    <div className="flex items-center space-x-4 pl-6 pr-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            className="rounded-full"
                        >
                            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-3">
                            Get Started
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}