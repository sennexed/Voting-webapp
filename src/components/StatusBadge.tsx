import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'live' | 'upcoming' | 'ended'
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 font-mono text-xs uppercase tracking-widest',
        {
          'bg-signal-red text-white': status === 'live',
          'bg-warning-yellow text-text-primary': status === 'upcoming',
          'bg-text-secondary text-white': status === 'ended',
        },
        className
      )}
    >
      {status === 'live' && (
        <span className="w-2 h-2 bg-white rounded-full animate-pulse-dot" />
      )}
      {status}
    </span>
  )
}
