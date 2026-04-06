import React from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, variant = 'default', size = 'default', ...props }) {
  const variants = {
    default: 'bg-slate-900 text-white hover:opacity-95',
    outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 py-1.5 text-sm',
  }
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-md transition disabled:opacity-50', variants[variant], sizes[size], className)} {...props} />
}
