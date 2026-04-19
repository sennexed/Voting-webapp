import { forwardRef, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={id} 
            className="block font-mono text-sm uppercase tracking-widest text-text-secondary mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 font-body text-base bg-background border-2 border-text-primary focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none',
            error && 'border-signal-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 font-mono text-xs text-signal-red">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
