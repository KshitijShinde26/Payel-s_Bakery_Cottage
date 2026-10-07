import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus-ring disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-amber-700 shadow-sm active:scale-98',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-amber-100 shadow-sm active:scale-98 border border-amber-200',
      outline: 'border border-amber-300 bg-transparent text-stone-700 hover:bg-amber-50 active:scale-98',
      ghost: 'bg-transparent text-stone-600 hover:bg-amber-50 hover:text-amber-900',
      link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0 h-auto',
      danger: 'bg-error text-error-foreground hover:bg-red-700 shadow-sm active:scale-98',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm rounded-sm',
      md: 'h-10 px-5 text-base rounded-md',
      lg: 'h-12 px-8 text-lg rounded-lg',
    }

    return (
      <button
        type={type}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== 'link' && sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
