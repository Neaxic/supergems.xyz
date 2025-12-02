import { Separator } from "./ui/separator"
import { useChatContext } from "@/contexts/chatContext"
import { MessagesSquare } from "lucide-react"
import { PrepareChatParrent } from "./pepare-chat-parrent"

export function ChatBar({ isCollabsed }: Readonly<{ isCollabsed: boolean }>) {
  const { isConnected } = useChatContext();

  return (
    <div className="flex flex-col h-screen bg-background rounded-lg shadow-lg overflow-scroll">
      <div className={`flex items-center ${isCollabsed && "justify-center"} px-4 py-2 h-full`} style={{ height: "100%", maxHeight: "52px" }}>
        <h1 className="text-xl font-bold">{isCollabsed ? <MessagesSquare width={18} /> : "Chatroom"}</h1>
      </div>
      <Separator />
      {!isCollabsed && (
        <div className="flex flex-col h-screen bg-background rounded-lg shadow-lg">
          <div className="flex items-center px-4 py-2 h-full max-h-8">
            <p className="opacity-30 text-sm">Room: {isConnected ? "Public" : "Disconnected"}</p>
          </div>
          <Separator />
          <PrepareChatParrent />
        </div>
      )}

    </div>
  )
}