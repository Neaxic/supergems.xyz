"use client"
import { useEffect, useState } from "react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog"

export function PromtInstaller() {
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window).MSStream
        )

        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    }, [])

    if (isStandalone) {
        return null // Don't show install button if already installed
    }

    return (
        <div>
            <AlertDialog open={isIOS}>
                {/* <AlertDialogTrigger >Open</AlertDialogTrigger> */}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Want to get our app?</AlertDialogTitle>
                        <AlertDialogDescription>
                            It a smoother experience, requires less signup - and enables you to recive notifications

                            <p>
                                To install this app on your iOS device, tap the share button
                                <span role="img" aria-label="share icon">
                                    {' '}
                                    ⎋{' '}
                                </span>
                                and then Add to Home Screen
                                <span role="img" aria-label="plus icon">
                                    {' '}
                                    ➕{' '}
                                </span>.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}