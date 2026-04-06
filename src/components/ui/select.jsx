import React, { createContext, useContext } from 'react'
import { cn } from '@/lib/utils'
const SelectContext = createContext(null)
export function Select({ value, onValueChange, children }) { return <SelectContext.Provider value={{ value, onValueChange }}>{children}</SelectContext.Provider> }
export function SelectTrigger({ className, children }) { return <div className={cn('flex h-10 w-full items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm', className)}>{children}</div> }
export function SelectValue() { const ctx = useContext(SelectContext); return <span>{ctx?.value}</span> }
export function SelectContent({ children }) { const ctx=useContext(SelectContext); const items=[]; React.Children.forEach(children, child=>{ if (React.isValidElement(child)) items.push(child.props) }) ; return <select className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={ctx?.value} onChange={(e)=>ctx?.onValueChange?.(e.target.value)}>{items.map((p)=><option key={p.value} value={p.value}>{p.children}</option>)}</select> }
export function SelectItem(props) { return null }
