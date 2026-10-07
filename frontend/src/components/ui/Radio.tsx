import React, { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: boolean
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error = false, id, name, ...props }, ref) => {
    const uniqueId = React.useId()
    const generatedId = id || uniqueId

    return (
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          id={generatedId}
          name={name}
          className={cn(
            'h-4 w-4 border-stone-300 text-primary focus:ring-primary focus-ring cursor-pointer transition-all duration-150',
            error && 'border-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={generatedId}
            className="text-sm font-medium text-stone-700 select-none cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Radio.displayName = 'Radio'
