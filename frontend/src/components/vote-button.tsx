'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronUp } from 'lucide-react';

interface VoteButtonProps {
  feedbackId: string;
  initialVoteCount: number;
  hasVoted?: boolean;
  onVoteAction: (feedbackId: string) => Promise<void>;
  onUnvoteAction: (feedbackId: string) => Promise<void>;
}

export function VoteButton({
  feedbackId,
  initialVoteCount,
  hasVoted = false,
  onVoteAction,
  onUnvoteAction,
}: VoteButtonProps) {
  const [isVoted, setIsVoted] = useState(hasVoted);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isVoted) {
        await onUnvoteAction(feedbackId);
        setIsVoted(false);
        setVoteCount(prev => prev - 1);
      } else {
        await onVoteAction(feedbackId);
        setIsVoted(true);
        setVoteCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
      className={cn(
        'flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] cursor-pointer transition-all',
        isVoted
          ? 'bg-primary text-white hover:bg-primary/90 hover:text-white border-primary'
          : 'hover:border-primary/50 hover:text-primary',
      )}
    >
      <ChevronUp className={cn('h-4 w-4', isLoading && 'animate-pulse')} />
      <span className="text-sm font-semibold">{voteCount}</span>
    </Button>
  );
}
