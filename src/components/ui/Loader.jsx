export default function Loader({ label = 'Loading...', fullscreen = false }) {
  return (
    <div
      className={`${fullscreen ? 'min-h-screen' : 'min-h-[200px]'} flex items-center justify-center`}
      role="status"
      aria-label={label}
    >
      <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
    </div>
  )
}
