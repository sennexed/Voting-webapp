interface StatCardProps {
  label: string
  value: number
  testId: string
}

export default function StatCard({ label, value, testId }: StatCardProps) {
  return (
    <div className="control-room-cell p-6" data-testid={testId}>
      <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-2">
        {label}
      </p>
      <p className="font-mono text-6xl font-semibold text-text-primary">
        {value.toLocaleString()}
      </p>
    </div>
  )
}
