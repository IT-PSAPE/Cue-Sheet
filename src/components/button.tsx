import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cv } from '../util/cv'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'danger-secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const buttonStyles = cv({
  base: [
    'inline-flex items-center justify-center font-medium rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  variants: {
    variant: {
      primary: ['bg-pink-600 text-white hover:bg-pink-700 focus:ring-foreground-brand-primary/40'],
      secondary: ['bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-foreground-brand-primary/40'],
      danger: ['bg-red-600 text-white hover:bg-red-700 focus:ring-foreground-brand-primary/40'],
      'danger-secondary': ['border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-foreground-brand-primary/40'],
      ghost: ['bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-foreground-brand-primary/40'],
    },
    size: {
      sm: ['px-2.5 py-1.5 text-sm'],
      md: ['px-4 py-2 text-sm'],
      lg: ['px-6 py-3 text-base'],
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export function Button({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, size, className })} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
