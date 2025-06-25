import { Badge } from '@/components/ui/badge'
import { categoryConfig, type FeedbackCategory } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  category: FeedbackCategory
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category]
  
  return (
    <Badge 
      className={cn(
        'text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: `var(--category-${category})`,
        color: 'white',
        borderColor: 'transparent'
      }}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  )
}
