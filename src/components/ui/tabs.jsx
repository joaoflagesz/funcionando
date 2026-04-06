import React, { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'
const TabsContext = createContext(null)
export function Tabs({ defaultValue, className, children }) { const [value,setValue]=useState(defaultValue); return <TabsContext.Provider value={{value,setValue}}><div className={className}>{children}</div></TabsContext.Provider> }
export function TabsList({ className, ...props }) { return <div className={cn('inline-grid gap-1 rounded-md bg-slate-100 p-1', className)} {...props} /> }
export function TabsTrigger({ value, className, children }) { const ctx=useContext(TabsContext); const active=ctx.value===value; return <button className={cn('rounded-md px-3 py-1.5 text-sm', active?'bg-white shadow text-slate-900':'text-slate-600', className)} onClick={()=>ctx.setValue(value)}>{children}</button> }
export function TabsContent({ value, className, children }) { const ctx=useContext(TabsContext); if (ctx.value!==value) return null; return <div className={className}>{children}</div> }
