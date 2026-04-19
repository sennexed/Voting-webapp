import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'font-mono uppercase tracking-widest border-2 border-text-primary transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-brand-blue text-white hover:bg-brand-blue-hover': variant === 'primary',
            'bg-background text-text-primary hover:bg-subtle-grey': variant === 'secondary',
            'bg-signal-red text-white hover:bg-red-700': variant === 'danger',
            'bg-transparent text-text-primary hover:bg-subtle-grey border-0': variant === 'ghost',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
