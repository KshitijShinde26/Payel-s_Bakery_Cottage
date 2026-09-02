import React from 'react'
import { cn } from '@/utils/cn'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  children,
  ...props
}) => {
  const baseStyles = 'flex gap-3 rounded-lg border p-4 text-sm'

  const variants = {
    info: 'bg-blue-50/50 border-blue-200 text-blue-800',
    success: 'bg-green-50/50 border-green-200 text-green-800',
    warning: 'bg-yellow-50/50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50/50 border-red-200 text-red-800',
  }

  const icons = {
    info: <Info className="h-5 w-5 shrink-0 text-blue-600" />,
    success: <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />,
    warning: <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />,
    error: <XCircle className="h-5 w-5 shrink-0 text-red-600" />,
  }

  return (
    <div
      role="alert"
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 leading-tight">{title}</h5>}
        <div className="leading-normal opacity-90">{children}</div>
      </div>
    </div>
  )
}
