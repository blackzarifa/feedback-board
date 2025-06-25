import { Badge } from '@/components/ui/badge';
import { statusConfig, type FeedbackStatus } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: FeedbackStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      className={cn('text-xs font-medium', className)}
      style={{
        backgroundColor: `var(--status-${status.replace('_', '-')})`,
        color: config.textColor === 'text-white' ? 'white' : 'black',
        borderColor: 'transparent',
      }}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
