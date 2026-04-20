import { useState, useEffect } from 'react'
import { electionsApi, Election, Stats } from '@/lib/api'
import StatCard from '@/components/StatCard'
import ElectionCard from '@/components/ElectionCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'live' | 'upcoming' | 'ended'

export default function HomePage() {
  const [elections, setElections] = useState<Election[]>([])
  const [stats, setStats] = useState<Stats>({ active_elections: 0, scheduled_elections: 0, total_votes: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [electionsRes, statsRes] = await Promise.all([
        electionsApi.list(),
        electionsApi.stats(),
      ])
      setElections(electionsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredElections = elections.filter(e => {
    if (activeTab === 'all') return true
    return e.status === activeTab
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'ALL' },
    { key: 'live', label: 'LIVE' },
    { key: 'upcoming', label: 'UPCOMING' },
    { key: 'ended', label: 'ENDED' },
  ]

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="border-b-2 border-text-primary grid-pattern" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-left mb-4">
              One voice. One vote.{' '}
              <span className="text-brand-blue">Zero noise.</span>
            </h1>
            <p className="font-body text-xl text-text-secondary max-w-2xl">
              Transparent, accessible civic voting for everyone. No accounts, no barriers.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="control-room-grid grid grid-cols-1 md:grid-cols-3" data-testid="stats-grid">
            <StatCard 
              label="Active Elections" 
              value={stats.active_elections} 
              testId="stat-active-elections"
            />
            <StatCard 
              label="Scheduled" 
              value={stats.scheduled_elections} 
              testId="stat-scheduled-elections"
            />
            <StatCard 
              label="Total Votes Cast" 
              value={stats.total_votes} 
              testId="stat-total-votes"
            />
          </div>
        </div>
      </section>

      {/* Elections Registry */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="elections-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="font-display text-3xl font-semibold text-left">Elections Registry</h2>
          
          {/* Filter Tabs */}
          <div className="flex border-2 border-text-primary" data-testid="filter-tabs">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                data-testid={`filter-tab-${tab.key}`}
                className={cn(
                  'px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors duration-150',
                  activeTab === tab.key 
                    ? 'bg-text-primary text-white' 
                    : 'bg-background text-text-primary hover:bg-subtle-grey'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filteredElections.length === 0 ? (
          <EmptyState 
            title="No elections found"
            description={activeTab === 'all' 
              ? "There are no elections yet. Be the first to create one!" 
              : `No ${activeTab} elections at the moment.`
            }
            actionLabel={activeTab === 'all' ? "CREATE ELECTION" : undefined}
            actionHref={activeTab === 'all' ? "/create" : undefined}
          />
        ) : (
          <div className="control-room-grid grid grid-cols-1 lg:grid-cols-2" data-testid="elections-grid">
            {filteredElections.map(election => (
              <ElectionCard key={election.id} election={election} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
