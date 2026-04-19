export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" data-testid="loading-spinner">
      <span className="font-mono text-xl">
        LOADING<span className="animate-blink">_</span>
      </span>
    </div>
  )
}
