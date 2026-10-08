import Button from './Button'

export default function ConfirmDialog({ open, title, message, busy, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-5 w-full max-w-sm">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
