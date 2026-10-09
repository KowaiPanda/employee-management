import { useEffect, useId, useRef } from 'react'
import Button from './Button'
import Icon from './Icon'

export default function ConfirmDialog({ open, title, message, busy, onConfirm, onCancel }) {
  const ref = useRef(null)
  const id = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!open || !dialog) return
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
    }
  }, [open])

  if (!open) return null
  return (
    <dialog ref={ref} aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}
      onCancel={(event) => { event.preventDefault(); if (!busy) onCancel() }}
      onClick={(event) => { if (event.target === event.currentTarget && !busy) onCancel() }}
      className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-xl border border-stone-200 bg-white p-0 text-stone-900 shadow-xl backdrop:bg-slate-950/50">
      <div className="p-6">
        <span className="mb-5 flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700"><Icon name="trash" className="size-5" /></span>
        <h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight">{title}</h2>
        <p id={`${id}-message`} className="mt-2 text-sm leading-6 text-stone-500">{message}</p>
        <div className="mt-7 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : 'Delete employee'}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
