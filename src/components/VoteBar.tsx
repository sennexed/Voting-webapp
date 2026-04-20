import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Candidate } from '@/lib/api'

interface VoteBarProps {
  candidate: Candidate
  totalVotes: number
  isLeader: boolean
  previousVotes?: number
}

export default function VoteBar({ candidate, totalVotes, isLeader, previousVotes }: VoteBarProps) {
  const [flash, setFlash] = useState(false)
  const percentage = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0
  
  useEffect(() => {
    if (previousVotes !== undefined && candidate.votes > previousVotes) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 500)
      return () => clearTimeout(timer)
    }
  }, [candidate.votes, previousVotes])

  return (
    <div 
      className="mb-4"
      data-testid={`vote-bar-${candidate.id}`}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold">{candidate.name}</span>
          {isLeader && (
            <span className="px-2 py-0.5 bg-brand-blue text-white font-mono text-xs uppercase tracking-widest">
              LEADER
            </span>
          )}
        </div>
        <span 
          className={cn(
            'font-mono text-lg font-semibold transition-all',
            flash && 'animate-flash-red'
          )}
          data-testid={`vote-count-${candidate.id}`}
        >
          {candidate.votes.toLocaleString()}
        </span>
      </div>
      
      <div className="w-full h-8 bg-subtle-grey border-2 border-text-primary">
        <div 
          className={cn(
            'h-full transition-all duration-500 ease-out',
            isLeader ? 'bg-brand-blue' : 'bg-text-secondary'
          )}
          style={{ width: `${percentage}%` }}
          data-testid={`vote-bar-fill-${candidate.id}`}
        />
      </div>
      
      <div className="flex justify-end mt-1">
        <span className="font-mono text-sm text-text-secondary">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}
