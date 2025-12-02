"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckIcon, XIcon } from "lucide-react"

export function TradeRequestModal() {
  const [isOpen, setIsOpen] = useState(true)

  const handleAccept = () => {
    console.log("Trade accepted")
    setIsOpen(false)
  }

  const handleDecline = () => {
    console.log("Trade declined")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Trade Request</DialogTitle>
          <DialogDescription>
            {"You've received a trade request from the following user:"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User Avatar" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">CryptoNinja88</h3>
              <p className="text-sm text-muted-foreground">Joined 2021 • 50+ trades</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Offering:</h4>
            <div className="flex items-center gap-2">
              <img
                src="/placeholder.svg?height=60&width=60&text=NFT"
                alt="NFT"
                className="h-15 w-15 rounded-md"
              />
              <div>
                <p className="font-medium">Bored Ape #1234</p>
                <Badge variant="secondary">Estimated value: 50 ETH</Badge>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Message:</h4>
            <p className="text-sm text-muted-foreground">
              {"Hey! I'm interested in trading my Bored Ape for your CryptoPunk. Let me know if you're interested!"}
            </p>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button variant="default" onClick={handleAccept} className="w-full sm:w-auto">
            <CheckIcon className="mr-2 h-4 w-4" /> Accept Trade
          </Button>
          <Button variant="outline" onClick={handleDecline} className="w-full sm:w-auto">
            <XIcon className="mr-2 h-4 w-4" /> Decline
          </Button>
          <Button variant="link" className="w-full sm:w-auto">
            View Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}