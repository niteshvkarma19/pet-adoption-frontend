const statusClasses = {
  Pending: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
  Available: 'bg-green-100 text-green-700',
  available: 'bg-green-100 text-green-700',
  Adopted: 'bg-gray-100 text-gray-700',
  adopted: 'bg-gray-100 text-gray-700',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}
    >
      {status}
    </span>
  )
}
