"use client"

import { useRouter } from "next/navigation";
import { ChatView } from "./chat-view"
import { useChatContext } from "@/contexts/chatContext"
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserContext } from "@/contexts/userContext";

export function PrepareChatParrent() {
    const router = useRouter()
    const { loadedMessages, sendMessage, isConnected, giveRep } = useChatContext();
    const { address } = useUserContext();
    const [inputField, setInputField] = useState<string>('')

    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const ownAddressLowercase = address?.toLowerCase()

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [])

    const prepareMessage = useCallback(() => {
        if (inputField === "") return
        if (address === undefined) return

        sendMessage(inputField)
        setInputField("");
    }, [inputField, sendMessage, address])

    return (
        <ChatView
            loadedMessages={loadedMessages}
            inputField={inputField}
            onInputChange={(e) => {
                setInputField(e.target.value)
            }}
            onGiveRep={giveRep}
            onProfileVisit={(address) => router.push(`/d/profile/${address}`)}
            scrollAreaRef={scrollAreaRef}
            ownAddressLowercase={ownAddressLowercase || ""}
            isConnected={isConnected}
            onMessageSend={prepareMessage} />
    )
}