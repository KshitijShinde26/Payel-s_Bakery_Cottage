import React from 'react'

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col rounded-2xl bg-white border border-amber-100/80 p-4 shadow-xs animate-pulse">
      <div className="aspect-square w-full rounded-xl bg-amber-100/60" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-1/4 rounded bg-amber-100/80" />
        <div className="h-5 w-3/4 rounded bg-amber-200/70" />
        <div className="h-3 w-full rounded bg-stone-100" />
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-amber-50 pt-3">
        <div className="h-6 w-16 rounded bg-amber-200/70" />
        <div className="h-9 w-9 rounded-xl bg-amber-200/70" />
      </div>
    </div>
  )
}
export default SkeletonCard
