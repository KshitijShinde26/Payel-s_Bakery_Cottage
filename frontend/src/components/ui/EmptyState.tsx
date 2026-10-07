import React from 'react'
import { cn } from '@/utils/cn'
import { Inbox } from 'lucide-react'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  className,
  title = 'No data found',
  description,
  icon,
  action,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-stone-200 rounded-lg bg-stone-50/30',
        className
      )}
      {...props}
    >
      <div className="text-stone-400 mb-3 bg-amber-50 p-3 rounded-full">
        {icon || <Inbox className="h-10 w-10 text-amber-700/60" />}
      </div>
      <h3 className="text-lg font-semibold text-stone-900 font-serif">{title}</h3>
      {description && (
        <p className="text-sm text-stone-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
