import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'ghost' | 'outline'
  size?: 'sm' | 'md'
}

export default function Button({ variant = 'accent', size = 'md', className, children, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-semibold rounded-xl transition-all duration-150 disabled:opacity-40',
        size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2.5',
        variant === 'accent' && 'accent hover:opacity-90 glow-accent',
        variant === 'ghost' && 'text-muted hover:bg-surface2 hover:text-accent',
        variant === 'outline' && 'border border-base hover:bg-surface2 hover:border-accent/40',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
