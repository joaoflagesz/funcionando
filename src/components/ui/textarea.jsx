import React from 'react'
import { cn } from '@/lib/utils'

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn('min-h-[110px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500', className)} {...props} />
})
