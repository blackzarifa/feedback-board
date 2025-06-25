'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronUp } from 'lucide-react'

interface VoteButtonProps {
  feedbackId: string
  initialVoteCount: number
  hasVoted?: boolean
  onVote: (feedbackId: string) => Promise<void>
  onUnvote: (feedbackId: string) => Promise<void>
}

export function VoteButton({ 
  feedbackId, 
  initialVoteCount, 
  hasVoted = false,
  onVote,
  onUnvote
}: VoteButtonProps) {
  const [isVoted, setIsVoted] = useState(hasVoted)
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      if (isVoted) {
        await onUnvote(feedbackId)
        setIsVoted(false)
        setVoteCount(prev => prev - 1)
      } else {
        await onVote(feedbackId)
        setIsVoted(true)
        setVoteCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
      className={cn(
        'flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px]',
        isVoted && 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
    >
      <ChevronUp className={cn('h-4 w-4', isLoading && 'animate-pulse')} />
      <span className="text-sm font-semibold">{voteCount}</span>
    </Button>
  )
}
