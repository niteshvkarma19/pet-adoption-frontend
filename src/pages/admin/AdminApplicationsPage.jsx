import { useEffect, useState } from 'react'
import { getAllAdoptions, updateAdoptionStatus } from '../../api/adoptions.js'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [action, setAction] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setError('')
      try {
        const data = await getAllAdoptions()
        setApplications(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e.message || 'Failed to load applications.')
      }
    }
    load()
  }, [])

  const applyAction = async () => {
    if (!action) return
    setError('')
    try {
      const updated = await updateAdoptionStatus(action.id, action.status)
      setApplications((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? {
                ...item,
                status: updated.status,
                ...(updated.raw?.user ? { user: updated.raw.user } : {}),
                ...(updated.raw?.pet ? { pet: updated.raw.pet, petName: updated.raw.pet?.name } : {}),
              }
            : item,
        ),
      )
      setAction(null)
    } catch (e) {
      setError(e.message || 'Failed to update application.')
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Adoption Management</h2>
      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">Application ID</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Pet Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((item) => (
              <tr key={item.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{item.userName || item.user?.name || '-'}</p>
                  <p className="text-xs text-gray-500">{item.userEmail || item.user?.email || '-'}</p>
                </td>
                <td className="px-4 py-3">{item.petName}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="flex gap-2 px-4 py-3">
                  <Button
                    variant="success"
                    onClick={() => setAction({ id: item.id, status: 'approved' })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setAction({ id: item.id, status: 'rejected' })}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <Modal
        open={Boolean(action)}
        title="Confirm action"
        description={`Are you sure you want to mark this application as ${action?.status}?`}
        onClose={() => setAction(null)}
        onConfirm={applyAction}
        confirmText="Confirm"
      />
    </section>
  )
}
