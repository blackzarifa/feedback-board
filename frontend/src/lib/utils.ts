import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const statusConfig = {
  new: {
    label: 'New',
    color: 'bg-status-new',
    textColor: 'text-white',
    icon: '✨',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-status-under-review',
    textColor: 'text-black',
    icon: '👀',
  },
  planned: {
    label: 'Planned',
    color: 'bg-status-planned',
    textColor: 'text-white',
    icon: '📅',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-status-in-progress',
    textColor: 'text-black',
    icon: '🚧',
  },
  completed: {
    label: 'Completed',
    color: 'bg-status-completed',
    textColor: 'text-white',
    icon: '✅',
  },
} as const;

export const categoryConfig = {
  feature: {
    label: 'Feature',
    color: 'bg-category-feature',
    textColor: 'text-white',
    icon: '✨',
  },
  bug: {
    label: 'Bug',
    color: 'bg-category-bug',
    textColor: 'text-white',
    icon: '🐛',
  },
  improvement: {
    label: 'Improvement',
    color: 'bg-category-improvement',
    textColor: 'text-white',
    icon: '💡',
  },
  other: {
    label: 'Other',
    color: 'bg-category-other',
    textColor: 'text-white',
    icon: '📝',
  },
} as const;

export type FeedbackStatus = keyof typeof statusConfig;
export type FeedbackCategory = keyof typeof categoryConfig;

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
