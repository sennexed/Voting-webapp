import { Box } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './ui/Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state">
      {/* Minimalist 3D ballot box illustration */}
      <div className="w-32 h-32 mb-8 relative">
        <div className="absolute inset-0 bg-subtle-grey border-2 border-text-primary transform rotate-3"></div>
        <div className="absolute inset-0 bg-background border-2 border-text-primary flex items-center justify-center">
          <Box className="w-12 h-12 text-text-secondary" />
        </div>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-text-primary"></div>
      </div>
      
      <h3 className="font-display text-2xl font-semibold mb-2 text-center">{title}</h3>
      <p className="font-body text-text-secondary text-center max-w-md mb-6">{description}</p>
      
      {actionLabel && actionHref && (
        <Link to={actionHref}>
          <Button variant="primary" data-testid="empty-state-action">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}
