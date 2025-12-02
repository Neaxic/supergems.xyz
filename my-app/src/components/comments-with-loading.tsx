import { useState, useRef, useEffect } from 'react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { IComment } from '@/lib/interfaces/IUtil'
import Avatar from 'boring-avatars'
import { formatDistanceToNow } from 'date-fns'

interface CommentsWithLoadingProps {
  // some props
  comments: IComment[];
  isLoading: boolean;
  disabled: boolean;
  onSubmit: (message: string) => void
}

export function CommentsWithLoading({ comments, isLoading, disabled, onSubmit }: CommentsWithLoadingProps) {
  const [localDisabled, setLocalDisabled] = useState(true);
  const [newComment, setNewComment] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const minLenght = 4;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmit(newComment);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [comments]);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    if (newComment.trim().length > minLenght) {
      setLocalDisabled(false);
    } else {
      setLocalDisabled(true);
    }
  }, [newComment])

  return (
    <div className="bg-background border rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="p-4 border-b flex gap-2">
        <Input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full mb-2"
          disabled={disabled}
        />
        <Button type="submit" className="" disabled={disabled || localDisabled}>
          {`Post Comment ${localDisabled ? `(min. ${minLenght - newComment.length} letters)` : ""}`}
        </Button>
      </form>
      <ScrollArea className="max-h-[300px] min-h-[50px] relative" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div>
              {comments.length === 0 && (
                <div className='flex w-full items-center justify-center'>
                  <p className="text-muted-foreground">No comments yet</p>
                </div>
              )}
              {comments?.map((comment, index) => (
                <div key={comment.address + index} className="flex space-x-4">
                  <Avatar width={32} height={32} variant='beam' name={comment.address.toLowerCase()} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className='flex gap-2 items-center'>
                        <h3 className="font-semibold">{comment.name !== "Anonymous" ? comment.name : comment.address}</h3>
                        {comment.name !== "Anonymous" && (
                          <span className="text-sm text-muted-foreground">{comment.address}</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(Number(comment.timestamp) * 1000), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </ScrollArea>
    </div>
  )
}