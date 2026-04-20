import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { electionsApi, Election, Candidate } from '@/lib/api'
import StatusBadge from '@/components/StatusBadge'
import VoteBar from '@/components/VoteBar'
import CountdownTimer from '@/components/CountdownTimer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const previousVotes = useRef<Record<string, number>>({})

  useEffect(() => {
    if (id) fetchElection()
  }, [id])

  // Auto-refresh every 3 seconds
  useEffect(() => {
    if (!id || !election || election.status === 'ended') return

    const interval = setInterval(() => {
      fetchElection(true)
    }, 3000)

    return () => clearInterval(interval)
  }, [id, election?.status])

  const fetchElection = async (silent = false) => {
    try {
      const response = await electionsApi.get(id!)
      
      // Store previous votes for flash animation
      if (election) {
        election.candidates.forEach(c => {
          previousVotes.current[c.id] = c.votes
        })
      }
      
      setElection(response.data)
      setLastUpdate(new Date())
    } catch (error) {
      if (!silent) {
        toast.error('Failed to load election results')
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!election) {
    return null
  }

  // Sort candidates by votes (descending)
  const sortedCandidates = [...election.candidates].sort((a, b) => b.votes - a.votes)
  const maxVotes = Math.max(...sortedCandidates.map(c => c.votes))
  
  const countdownTarget = election.status === 'upcoming' 
    ? new Date(election.start_time) 
    : new Date(election.end_time)
  const countdownLabel = election.status === 'upcoming' 
    ? 'OPENS IN' 
    : election.status === 'live' 
      ? 'CLOSES IN' 
      : 'ENDED'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="results-page">
      <button
        onClick={() => navigate(`/election/${election.id}`)}
        className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-text-secondary hover:text-text-primary mb-8"
        data-testid="back-button"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO ELECTION
      </button>

      {/* Header */}
      <div className="border-2 border-text-primary p-6 mb-8" data-testid="results-header">
        <div className="flex items-start justify-between mb-4">
          <StatusBadge status={election.status} />
          <CountdownTimer targetDate={countdownTarget} label={countdownLabel} />
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-left mb-4">
          {election.title}
        </h1>
        
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm text-text-secondary">
            <span className="text-text-primary font-semibold text-3xl" data-testid="total-votes">
              {election.total_votes}
            </span>{' '}
            total votes
          </div>
          
          {election.status === 'live' && (
            <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AUTO-REFRESH</span>
              <span className="text-text-primary">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Results Chart */}
      <div className="border-2 border-text-primary p-6" data-testid="results-chart">
        <h2 className="font-display text-2xl font-semibold text-left mb-6">
          Live Results
        </h2>
        
        <div className="space-y-6">
          {sortedCandidates.map(candidate => (
            <VoteBar
              key={candidate.id}
              candidate={candidate}
              totalVotes={election.total_votes}
              isLeader={candidate.votes === maxVotes && maxVotes > 0}
              previousVotes={previousVotes.current[candidate.id]}
            />
          ))}
        </div>

        {election.total_votes === 0 && (
          <div className="text-center py-8 font-mono text-text-secondary" data-testid="no-votes-message">
            No votes have been cast yet
          </div>
        )}
      </div>
    </div>
  )
}
