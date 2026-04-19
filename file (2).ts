import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Candidate {
  id: string
  name: string
  votes: number
}

export interface Election {
  id: string
  title: string
  description: string
  candidates: Candidate[]
  start_time: string
  end_time: string
  status: 'live' | 'upcoming' | 'ended'
  total_votes: number
  created_at: string
  has_voted?: boolean
}

export interface Stats {
  active_elections: number
  scheduled_elections: number
  total_votes: number
}

export interface CreateElectionPayload {
  title: string
  description: string
  candidates: string[]
  start_time: string
  end_time: string
}

export const electionsApi = {
  list: () => api.get<Election[]>('/elections'),
  get: (id: string) => api.get<Election>(`/elections/${id}`),
  create: (data: CreateElectionPayload) => api.post<Election>('/elections', data),
  delete: (id: string) => api.delete(`/elections/${id}`),
  vote: (electionId: string, candidateId: string) => 
    api.post(`/elections/${electionId}/vote`, { candidate_id: candidateId }),
  stats: () => api.get<Stats>('/elections/stats'),
}

export default api
