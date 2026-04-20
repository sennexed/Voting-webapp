import { useCountdown } from '@/hooks/useCountdown'

interface CountdownTimerProps {
  targetDate: Date
  label: string
}

export default function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const { formatted, isComplete } = useCountdown(targetDate)

  return (
    <div className="text-center" data-testid="countdown-timer">
      <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-2">
        {label}
      </p>
      <p className="font-mono text-4xl font-semibold tracking-tight" data-testid="countdown-value">
        {isComplete ? '00:00:00:00' : formatted}
      </p>
      <p className="font-mono text-xs text-text-secondary mt-1">
        DD:HH:MM:SS
      </p>
    </div>
  )
}
