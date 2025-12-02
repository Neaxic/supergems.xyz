"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Home, LayoutGrid, CreditCard, BookOpen, Users, Menu } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function PillHeaderBottom() {
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Features', href: '#features', icon: LayoutGrid },
        { name: 'Pricing', href: '#pricing', icon: CreditCard },
        { name: 'Blog', href: '#blog', icon: BookOpen },
        { name: 'Company', href: '#company', icon: Users },
    ]

    return (
        <div className="fixed bottom-4 left-0 right-0 md:hidden z-50">
            <div className="max-w-sm mx-auto px-4">
                <nav className="bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center p-2">
                    {navItems.slice(0, 4).map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center justify-center p-2 mx-2 text-gray-600 hover:text-gray-900"
                        >
                            <item.icon className="h-6 w-6" />
                            <span className="sr-only">{item.name}</span>
                        </Link>
                    ))}
                    <Button
                        onClick={() => setIsOpen(!isOpen)}
                        className="bg-gray-900 text-white hover:bg-gray-800 rounded-full p-2 mx-2"
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">More</span>
                    </Button>
                </nav>
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">More Options</h2>
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                <item.icon className="h-6 w-6 mr-3" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                        <Button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-4 bg-gray-200 text-gray-800 hover:bg-gray-300"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}