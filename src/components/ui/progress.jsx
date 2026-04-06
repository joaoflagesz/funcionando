import React from 'react'
export function Progress({ value = 0, className='' }) { return <div className={`h-3 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}><div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div> }
