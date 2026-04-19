import { Check, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Candidate } from '@/lib/api'

interface CandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
  showVotes?: boolean
}

export default function CandidateCard({ 
  candidate, 
  isSelected, 
  onSelect, 
  disabled = false,
  showVotes = false 
}: CandidateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      data-testid={`candidate-card-${candidate.id}`}
      className={cn(
        'w-full p-6 text-left border-2 transition-all duration-150',
        isSelected 
          ? 'border-brand-blue bg-brand-blue/5' 
          : 'border-text-primary bg-background hover:bg-subtle-grey',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 flex items-center justify-center border-2',
            isSelected ? 'bg-brand-blue border-brand-blue' : 'bg-subtle-grey border-text-primary'
          )}>
            {isSelected ? (
              <Check className="w-6 h-6 text-white" />
            ) : (
              <User className="w-6 h-6 text-text-secondary" />
            )}
          </div>
          <div>
            <h4 className="font-display text-xl font-semibold">{candidate.name}</h4>
            {showVotes && (
              <p className="font-mono text-sm text-text-secondary">
                {candidate.votes.toLocaleString()} votes
              </p>
            )}
          </div>
        </div>
        
        {isSelected && (
          <span className="font-mono text-xs uppercase tracking-widest text-brand-blue">
            SELECTED
          </span>
        )}
      </div>
    </button>
  )
}
