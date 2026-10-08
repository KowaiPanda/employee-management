export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 my-3 flex items-center">
      {message}
      {onRetry && (
        <button onClick={onRetry} className="ml-auto underline">Retry</button>
      )}
    </div>
  )
}
