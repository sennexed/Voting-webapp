import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'
import { electionsApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

export default function CreateElectionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  })
  const [candidates, setCandidates] = useState<string[]>(['', ''])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addCandidate = () => {
    setCandidates([...candidates, ''])
  }

  const removeCandidate = (index: number) => {
    if (candidates.length > 2) {
      setCandidates(candidates.filter((_, i) => i !== index))
    }
  }

  const updateCandidate = (index: number, value: string) => {
    const updated = [...candidates]
    updated[index] = value
    setCandidates(updated)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required'
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required'
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time)
      const end = new Date(formData.end_time)
      if (end <= start) {
        newErrors.end_time = 'End time must be after start time'
      }
    }

    const validCandidates = candidates.filter(c => c.trim())
    if (validCandidates.length < 2) {
      newErrors.candidates = 'At least 2 candidates are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        candidates: candidates.filter(c => c.trim()),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
      }

      const response = await electionsApi.create(payload)
      toast.success('Election created successfully!')
      navigate(`/election/${response.data.id}`)
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create election'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="create-election-page">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-text-secondary hover:text-text-primary mb-8"
        data-testid="back-button"
      >
        <ArrowLeft className="w-4 h-4" />
        BACK TO ELECTIONS
      </button>

      <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-left mb-8">
        Create Election
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8" data-testid="create-election-form">
        {/* Basic Info */}
        <div className="border-2 border-text-primary p-6 space-y-6">
          <h2 className="font-display text-2xl font-semibold text-left">Basic Information</h2>
          
          <Input
            id="title"
            label="Election Title"
            placeholder="e.g., Board of Directors Election 2024"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={errors.title}
            data-testid="input-title"
          />

          <Textarea
            id="description"
            label="Description"
            placeholder="Describe the purpose of this election..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            data-testid="input-description"
          />
        </div>

        {/* Schedule */}
        <div className="border-2 border-text-primary p-6 space-y-6">
          <h2 className="font-display text-2xl font-semibold text-left">Schedule</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              id="start_time"
              type="datetime-local"
              label="Start Time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              error={errors.start_time}
              data-testid="input-start-time"
            />

            <Input
              id="end_time"
              type="datetime-local"
              label="End Time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              error={errors.end_time}
              data-testid="input-end-time"
            />
          </div>
        </div>

        {/* Candidates */}
        <div className="border-2 border-text-primary p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-left">Candidates</h2>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addCandidate}
              data-testid="add-candidate-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              ADD
            </Button>
          </div>

          {errors.candidates && (
            <p className="font-mono text-xs text-signal-red">{errors.candidates}</p>
          )}

          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id={`candidate-${index}`}
                    placeholder={`Candidate ${index + 1} name`}
                    value={candidate}
                    onChange={(e) => updateCandidate(index, e.target.value)}
                    data-testid={`input-candidate-${index}`}
                  />
                </div>
                {candidates.length > 2 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeCandidate(index)}
                    data-testid={`remove-candidate-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/')}
            data-testid="cancel-button"
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            data-testid="submit-button"
          >
            {loading ? 'CREATING...' : 'CREATE ELECTION'}
          </Button>
        </div>
      </form>
    </div>
  )
}
