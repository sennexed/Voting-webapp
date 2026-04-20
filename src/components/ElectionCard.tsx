import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowRight, Users, Calendar } from 'lucide-react'
import { Election } from '@/lib/api'
import StatusBadge from './StatusBadge'

interface ElectionCardProps {
  election: Election
}

export default function ElectionCard({ election }: ElectionCardProps) {
  return (
    <div 
      className="control-room-cell bg-background hover:bg-subtle-grey transition-colors duration-150"
      data-testid={`election-card-${election.id}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <StatusBadge status={election.status} />
          <span className="font-mono text-xs text-text-secondary">
            {format(new Date(election.created_at), 'MMM d, yyyy')}
          </span>
        </div>
        
        <h3 className="font-display text-2xl font-semibold mb-2 text-left">
          {election.title}
        </h3>
        
        <p className="font-body text-text-secondary mb-4 line-clamp-2">
          {election.description}
        </p>
        
        <div className="flex items-center gap-4 mb-4 font-mono text-sm text-text-secondary">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {election.candidates.length} candidates
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(election.end_time), 'MMM d')}
          </span>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t-2 border-text-primary">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
              Total Votes
            </p>
            <p className="font-mono text-2xl font-semibold" data-testid={`election-votes-${election.id}`}>
              {election.total_votes.toLocaleString()}
            </p>
          </div>
          
          <Link
            to={election.status === 'ended' ? `/election/${election.id}/results` : `/election/${election.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-mono text-xs uppercase tracking-widest border-2 border-text-primary hover:bg-brand-blue-hover transition-colors duration-150"
            data-testid={`election-action-${election.id}`}
          >
            {election.status === 'ended' ? 'VIEW RESULTS' : 'VOTE NOW'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
