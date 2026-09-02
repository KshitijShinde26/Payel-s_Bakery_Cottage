import React from 'react'
import { cn } from '@/utils/cn'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export const FormField: React.FC<FormFieldProps> = ({
  className,
  label,
  error,
  hint,
  required,
  children,
  ...props
}) => {
  const errorId = React.useId()
  const hintId = React.useId()

  // Clone child to inject accessibility parameters automatically
  const childrenWithAria = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        error: !!error,
        'aria-invalid': error ? 'true' : 'false',
        'aria-describedby': cn(
          error && errorId,
          hint && hintId
        ) || undefined,
      })
    }
    return child
  })

  return (
    <div className={cn('flex flex-col space-y-1.5 w-full', className)} {...props}>
      {label && (
        <label className="text-sm font-semibold text-stone-700 flex items-center">
          {label}
          {required && <span className="text-error ml-1 font-sans">*</span>}
        </label>
      )}
      <div className="relative">{childrenWithAria}</div>
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-error leading-none mt-1 animate-fadeIn">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-xs text-stone-400 mt-1">
          {hint}
        </p>
      )}
    </div>
  )
}
