import React from 'react'
import { cn } from '@/utils/cn'
import { AlertCircle } from 'lucide-react'
import { Button } from './Button'

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  onRetry?: () => void
  retryText?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  className,
  title = 'Something went wrong',
  description = 'There was an issue processing your request. Please try again.',
  onRetry,
  retryText = 'Try Again',
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-lg bg-red-50/20',
        className
      )}
      {...props}
    >
      <div className="text-red-500 mb-3 bg-red-100/50 p-3 rounded-full">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900 font-serif">{title}</h3>
      <p className="text-sm text-stone-500 mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 border-red-200 text-red-800 hover:bg-red-50">
          {retryText}
        </Button>
      )}
    </div>
  )
}
