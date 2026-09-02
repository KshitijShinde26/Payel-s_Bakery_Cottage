import React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/utils/cn'

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  fallback?: string
}

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, src, alt, fallback, ...props }, ref) => {
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-amber-50',
        className
      )}
      {...props}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800 font-serif"
      >
        {fallback || (alt ? alt.substring(0, 2).toUpperCase() : 'U')}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
})

Avatar.displayName = AvatarPrimitive.Root.displayName
