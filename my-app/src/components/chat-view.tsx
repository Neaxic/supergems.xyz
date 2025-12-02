import { IMessage } from "@/contexts/chatContext";
import { ScrollArea } from "./ui/scroll-area";
import { format } from 'date-fns';
import { shortenAddress, shortenName } from "@/lib/helpers"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "./ui/menubar"
import Avatar from "boring-avatars";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";

interface ChatViewProps {
    loadedMessages?: IMessage[]
    ownAddressLowercase: string
    onMessageSend: () => void
    isConnected: boolean
    inputField: string
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    onGiveRep: (address: string) => void
    onProfileVisit: (address: string) => void
    scrollAreaRef: React.RefObject<HTMLDivElement>
}

export function ChatView({
    loadedMessages,
    ownAddressLowercase,
    onMessageSend,
    isConnected,
    inputField,
    onInputChange,
    onGiveRep,
    onProfileVisit,
    scrollAreaRef,
}: ChatViewProps) {
    return (
        <div>
            <ScrollArea className="" ref={scrollAreaRef}>
                <div className="p-4 space-y-4">
                    {loadedMessages?.map((message, index: number) => (
                        <div key={index}>
                            {message.user === undefined ? (<></>) : (
                                <div
                                    className={`flex ${message.user.address === ownAddressLowercase ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`flex ${message.user.address === ownAddressLowercase ? "flex-row-reverse" : "flex-row"
                                            } items-start space-x-2 max-w-[80%]`}
                                    >
                                        <Menubar className="border-none">
                                            <MenubarMenu>
                                                <MenubarTrigger className="p-0 focus:bg-transparent data-[state=open]:bg-transparent">
                                                    <Avatar name={message.user.address.toLowerCase()} size={32} variant="beam" />
                                                </MenubarTrigger>
                                                <MenubarContent>
                                                    <MenubarItem onClick={() => onProfileVisit(message.user.address)}>View Profile</MenubarItem>
                                                    <MenubarSeparator />
                                                    <MenubarItem onClick={() => onGiveRep(message.user.address)}>Rep User</MenubarItem>
                                                </MenubarContent>
                                            </MenubarMenu>
                                        </Menubar>

                                        <div
                                            className={`flex flex-col ${message.user.address === ownAddressLowercase ? "items-end" : "items-start"
                                                } ${message.user.address === ownAddressLowercase ? "pr-2" : "pl-1"}`}
                                        >
                                            <div className={`flex items-center space-x-2 ${message.user.address === ownAddressLowercase && "flex-row-reverse"}`}>
                                                <Menubar className="border-none">
                                                    <MenubarMenu>
                                                        <MenubarTrigger className="p-0 focus:bg-transparent data-[state=open]:bg-transparent">
                                                            <span className="text-sm font-medium">{message.user.name ? shortenName(message.user.name) : shortenAddress(message.user.address)}</span>
                                                        </MenubarTrigger>
                                                        <MenubarContent>
                                                            <MenubarItem onClick={() => onProfileVisit(message.user.address)}>View Profile</MenubarItem>
                                                            <MenubarSeparator />
                                                            <MenubarItem onClick={() => onGiveRep(message.user.address)}>Rep User</MenubarItem>
                                                        </MenubarContent>
                                                    </MenubarMenu>
                                                </Menubar>
                                                <span className={`text-sm text-muted-foreground ${message.user.address === ownAddressLowercase && "pr-2"}`}>
                                                    {message.user.rep}R
                                                </span>
                                                <span className={`text-sm text-muted-foreground`}>
                                                    {format(message.timestamp.toString(), "HH:mm")}
                                                </span>
                                            </div>
                                            <div
                                                className={`rounded-lg p-2 ${message.user.address === ownAddressLowercase
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                    }`}
                                            >
                                                <p className="text-sm">{message.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 bg-muted bottom-0 absolute" style={{ width: "-webkit-fill-available" }}>
                <form>
                    <div className="grid gap-4">
                        <Textarea
                            disabled={!isConnected || ownAddressLowercase === undefined || !ownAddressLowercase}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    onMessageSend()
                                    e.preventDefault()
                                }
                            }}
                            value={inputField}
                            onChange={onInputChange}
                            className="p-4"
                            placeholder={!isConnected && "Not connected" || !ownAddressLowercase && "Not logged in" || `Reply ...`}
                        />
                        <div className="flex items-center">
                            <Label
                                htmlFor="mute"
                                className="flex items-center gap-2 text-xs font-normal"
                            >
                                <Switch id="mute" aria-label="Mute thread" /> Mute @mentions
                            </Label>
                            <Button
                                disabled={!isConnected || !ownAddressLowercase || inputField === ""}
                                onClick={onMessageSend}
                                size="sm"
                                className="ml-auto"
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
