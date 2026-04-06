import React, { createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

const DialogContext = createContext(null)
export function Dialog({ open, onOpenChange, children }) { return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider> }
export function DialogTrigger({ asChild=false, children }) {
  const ctx = useContext(DialogContext)
  if (asChild && React.isValidElement(children)) return React.cloneElement(children, { onClick: () => ctx?.onOpenChange?.(true) })
  return <button onClick={() => ctx?.onOpenChange?.(true)}>{children}</button>
}
export function DialogContent({ className='', children }) {
  const ctx = useContext(DialogContext)
  if (!ctx?.open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => ctx.onOpenChange?.(false)}>
      <div className={`max-w-3xl w-full rounded-2xl bg-white p-6 shadow-2xl ${className}`} onClick={(e)=>e.stopPropagation()}>{children}</div>
    </div>, document.body)
}
export function DialogHeader({ children, ...props }) { return <div className="mb-4" {...props}>{children}</div> }
export function DialogTitle({ children, ...props }) { return <h2 className="text-xl font-bold" {...props}>{children}</h2> }
