'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Pencil, Check, X } from "lucide-react"
import { Textarea } from './ui/textarea'
import { cn } from '@/lib/utils'

interface SimpleUserMessageProps {
  message?: string;
  isLoading?: boolean;
  isOwner?: boolean;
  defaultIsEditing?: boolean;
  onSave?: (newMessage: string) => void;
}

export function SimpleUserMessage({ message, defaultIsEditing = false, isLoading = false, isOwner = true, onSave }: SimpleUserMessageProps) {
  const [isEditing, setIsEditing] = useState(defaultIsEditing)
  const [editedMessage, setEditedMessage] = useState(message)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (onSave && editedMessage !== "" && editedMessage !== undefined) {
      setIsSaving(true)
      onSave(editedMessage)
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditedMessage(message)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="w-full h-[80px] rounded-md" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="w-full min-h-[80px]  rounded-md relative">
        {isOwner && !isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit message</span>
          </Button>
        )}
        {isEditing ? (
          <div className="space-y-2 w-full h-full">
            <Textarea value={editedMessage} onChange={(e) => setEditedMessage(e.target.value)} className={cn("w-full min-h-[100px]")} placeholder="Enter your message" />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Skeleton className="h-4 w-4 mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="italic text-muted-foreground pr-12">
            <span className="text-2xl">&ldquo;</span>
            <span className="text-sm">{message}</span>
            <span className="text-2xl">&rdquo;</span>
          </div>
        )}
      </div>
    </div>
  )
}