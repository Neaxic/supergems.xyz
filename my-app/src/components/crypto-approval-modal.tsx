'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { XCircleIcon, RefreshCwIcon } from 'lucide-react'
import { INFTGONFT } from '@/lib/interfaces/NftGOv2'
import { ReloadIcon } from '@radix-ui/react-icons'
import { CopyAddress } from './copyAddress'
import { shortenAddress } from '../lib/helpers'
import UseApprove from '@/lib/hooks/UseApprovalHook'
import { toast } from 'sonner'

export interface CryptoApprovalModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  initialItems: INFTGONFT[]
  toWhom: string
  onAllApproved: () => void
}

export function CryptoApprovalModal({ isOpen, toWhom, setIsOpen, onAllApproved, initialItems }: CryptoApprovalModalProps) {
  const [items, setItems] = useState<(INFTGONFT & { status: 'pending' | 'loading' | 'approved' | 'failed' })[]>(initialItems.map(item => ({ ...item, status: 'pending' })))
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)
  const approvalHook = UseApprove({ onApprovedCollection: (data) => singleApproved(data), onErrorCollection: (message) => singleError(message) })

  const handleApprove = async (contractType: string, address: string, id: string) => {
    setItems(prevItems => prevItems.map(item =>
      item.token_id === id ? { ...item, status: 'loading' } : item
    ))

    try {
      setCurrentAddress(address)
      const initialReadResp = await approvalHook.submitApproval(contractType, toWhom, address, +id)
      if (initialReadResp) {
        setItems(prevItems => prevItems.map(item =>
          item.token_id === id ? { ...item, status: 'approved' } : item
        ))
      }
    } catch (error) {
      setItems(prevItems => prevItems.map(item =>
        item.token_id === id ? { ...item, status: 'failed' } : item
      ))
    }
  }

  const singleApproved = (data: string) => {
    console.log(data)
    setItems(prevItems => prevItems.map(item =>
      item.contract_address === currentAddress ? { ...item, status: 'approved' } : item
    ))
  }

  const singleError = (message: string) => {
    console.log(message)
    toast(message)
    setItems(prevItems => prevItems.map(item =>
      item.contract_address === currentAddress ? { ...item, status: 'failed' } : item
    ))
  }

  const handleRerun = (id: string) => {
    setItems(prevItems => prevItems.map(item =>
      item.token_id === id ? { ...item, status: 'pending' } : item
    ))
  }

  const allApproved = items.every(item => item.status === 'approved')

  useEffect(() => {
    if (allApproved) {
      onAllApproved?.()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allApproved])

  useEffect(() => {
    if (!isOpen) return

    setItems(initialItems.map(item => ({ ...item, status: 'pending' })))
  }, [initialItems, isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Approve collections</DialogTitle>
          <DialogDescription>
            Approve the following addresses before proceeding with the transaction.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] w-full pr-4">
          {items.map((item) => (
            <div key={`${item.token_id}-${item.status}`} className="flex items-center justify-between py-4 border-b last:border-b-0">
              <div className='flex gap-3'>
                <span className="font-mono text-sm">{item.name}</span>
                <span className="font-mono text-sm">
                  <CopyAddress fulltext={item.contract_address}>{shortenAddress(item.contract_address, 3)}</CopyAddress>
                </span>
              </div>
              <Button
                variant="outline"
                disabled={item.status === "approved" || item.status === "loading"}
                size="sm"
                onClick={() => handleApprove(item.contract_type ?? "", item.contract_address ?? '', item.token_id)}
              >
                {item.status === 'loading' && (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                {item.status === 'loading' ? 'Approving...' : item.status === 'approved' ? 'Approved' : 'Approve'}
              </Button>
              {item.status === 'failed' && (
                <div className="flex items-center space-x-2">
                  <XCircleIcon className="text-red-500" />
                  <Button variant="ghost" size="sm" onClick={() => handleRerun(item.token_id)}>
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
        <DialogFooter>
          <Button disabled={!allApproved} onClick={() => setIsOpen(false)}>
            Confirm Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}