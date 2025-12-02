'use client'

import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MissingNFTSlotProps {
  onClick?: () => void
}

export function MissingNftSlot({ onClick }: MissingNFTSlotProps = { onClick: () => { } }) {
  return (
    <Button
      variant="outline"
      className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
      onClick={onClick}
    >
      <PlusIcon className="w-8 h-8 text-gray-400" />
      <span className="sr-only">Add NFT</span>
    </Button>
  )
}