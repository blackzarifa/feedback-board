'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import { CategoryBadge } from '@/components/category-badge'
import { VoteButton } from '@/components/vote-button'
import { formatDate } from '@/lib/utils'
import type { Feedback } from '@/lib/types'

interface FeedbackCardProps {
  feedback: Feedback
  hasVoted?: boolean
  onVote: (feedbackId: string) => Promise<void>
  onUnvote: (feedbackId: string) => Promise<void>
}

export function FeedbackCard({ 
  feedback, 
  hasVoted = false,
  onVote,
  onUnvote
}: FeedbackCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={feedback.category} />
              <StatusBadge status={feedback.status} />
            </div>
            <h3 className="text-lg font-semibold leading-tight">
              {feedback.title}
            </h3>
          </div>
          <VoteButton
            feedbackId={feedback.id}
            initialVoteCount={feedback.voteCount}
            hasVoted={hasVoted}
            onVote={onVote}
            onUnvote={onUnvote}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {feedback.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(feedback.createdAt)}</span>
          {feedback.submitterEmail && (
            <span>by {feedback.submitterEmail.split('@')[0]}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
