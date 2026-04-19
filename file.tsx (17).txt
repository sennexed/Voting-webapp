import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, BarChart3, AlertCircle } from 'lucide-react'
import { electionsApi, Election } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import StatusBadge from '@/components/StatusBadge'
import CandidateCard from '@/components/CandidateCard'
import CountdownTimer from '@/components/CountdownTimer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ElectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [election, setElection] = useState<Election | null>(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchElection()
  }, [id])

  const fetchElection = async () => {
    try {
      const response = await electionsApi.get(id!)
      setElection(response.data)
    } catch (error) {
      toast.error('Failed to load election')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedCandidate || !election) return

    setVoting(true)

    try {
      await electionsApi.vote(election.id, selectedCandidate)
      toast.success('Your vote has been cast!')
      fetchElection() // Refresh to get updated vote counts
      setSelectedCandidate(null)
    } catch (error: any) {
      const status = error.response?.status
      const message = error.response?.data?.detail || 'Failed to cast vote'
      
      if (status === 409) {
        toast.error('You have already voted in this election')
      } else if (status === 400) {
        toast.error(message)
      } else {
        toast.error(message)
      }
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!election) {
    return null
  }

  const canVote = election.status === 'live' && !election.has_voted
  const countdownTarget = election.status === 'upcoming' 
    ? new Date(election.start_time) 
    : new Date(election.end_time)
  const countdownLabel = election.status === 'upcoming' 
    ? 'OPENS IN' 
    : election.status === 'live' 
      ? 'CLOSES IN' 
      : 'ENDED'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="election-detail-page">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-text-secondary hover:text-text-primary"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK
        </button>
        
        <Link
          to={`/election/${election.id}/results`}
          className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-brand-blue hover:text-brand-blue-hover"
          data-testid="view-results-link"
        >
          <BarChart3 className="w-4 h-4" />
          VIEW RESULTS
        </Link>
      </div>

      {/* Header */}
      <div className="border-2 border-text-primary p-6 mb-8" data-testid="election-header">
        <div className="flex items-start justify-between mb-4">
          <StatusBadge status={election.status} />
          <CountdownTimer targetDate={countdownTarget} label={countdownLabel} />
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-left mb-4">
          {election.title}
        </h1>
        
        <p className="font-body text-lg text-text-secondary mb-6">
          {election.description}
        </p>
        
        <div className="flex items-center gap-6 font-mono text-sm text-text-secondary">
          <span data-testid="total-votes-display">
            <span className="text-text-primary font-semibold text-2xl">{election.total_votes}</span> total votes
          </span>
          <span>
            <span className="text-text-primary font-semibold">{election.candidates.length}</span> candidates
          </span>
        </div>
      </div>

      {/* Already Voted Banner */}
      {election.has_voted && (
        <div 
          className="flex items-center gap-3 p-4 bg-subtle-grey border-2 border-text-primary mb-8"
          data-testid="already-voted-banner"
        >
          <AlertCircle className="w-5 h-5 text-brand-blue" />
          <p className="font-mono text-sm">
            You have already cast your vote in this election
          </p>
        </div>
      )}

      {/* Upcoming Notice */}
      {election.status === 'upcoming' && (
        <div 
          className="flex items-center gap-3 p-4 bg-warning-yellow/20 border-2 border-warning-yellow mb-8"
          data-testid="upcoming-notice"
        >
          <AlertCircle className="w-5 h-5 text-warning-yellow" />
          <p className="font-mono text-sm">
            This election has not started yet. Voting will open when the countdown reaches zero.
          </p>
        </div>
      )}

      {/* Candidates */}
      <div className="border-2 border-text-primary p-6" data-testid="candidates-section">
        <h2 className="font-display text-2xl font-semibold text-left mb-6">
          {canVote ? 'Select Your Candidate' : 'Candidates'}
        </h2>
        
        <div className="space-y-4 mb-8">
          {election.candidates.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate === candidate.id}
              onSelect={() => canVote && setSelectedCandidate(candidate.id)}
              disabled={!canVote}
              showVotes={election.status !== 'upcoming'}
            />
          ))}
        </div>

        {/* Vote Action */}
        {canVote && (
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedCandidate || voting}
              onClick={handleVote}
              data-testid="cast-vote-button"
            >
              {voting ? 'CASTING VOTE...' : 'CAST VOTE'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
