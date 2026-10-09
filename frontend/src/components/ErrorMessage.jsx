import Icon from './Icon'

export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null
  return (
    <div role="alert" className="my-4 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
      <p className="min-w-0 flex-1 leading-5">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="shrink-0 font-medium underline underline-offset-4">Retry</button>
      )}
    </div>
  )
}
