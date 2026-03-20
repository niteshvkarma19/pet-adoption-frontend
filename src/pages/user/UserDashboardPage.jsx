import { useEffect, useState } from 'react'
import * as adoptionsApi from '../../api/adoptions.js'
import { getPetById } from '../../api/pets.js'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import Loader from '../../components/ui/Loader.jsx'
import Button from '../../components/ui/Button.jsx'
import { useLocation, useNavigate } from 'react-router-dom'

const FALLBACK_PET_IMAGE =
  'https://placedog.net/400/539?id=189'

export default function UserDashboardPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const [viewOpen, setViewOpen] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState('')
  const [viewPet, setViewPet] = useState(null)
  const [viewPetId, setViewPetId] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await adoptionsApi.getMyAdoptions()
      setApplications(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    load()
  }, [location.pathname])

  useEffect(() => {
    if (!viewPetId) return
    let cancelled = false
    async function loadPet() {
      setViewLoading(true)
      setViewError('')
      try {
        const details = await getPetById(viewPetId)
        if (!cancelled) setViewPet(details)
      } catch (e) {
        if (!cancelled) setViewError(e.message || 'Failed to load pet details.')
      } finally {
        if (!cancelled) setViewLoading(false)
      }
    }
    loadPet()
    return () => {
      cancelled = true
    }
  }, [viewPetId])

  const openView = (application) => {
    const petId = application.petId || application.pet?._id || application.pet?.id
    setViewPetId(petId)
    setViewOpen(true)
  }

  const canAdopt = (status) => String(status || '').toLowerCase() === 'approved'

  const adopt = (application) => {
    const petId = application.petId || application.pet_id || application.pet?._id || application.pet?.id
    if (!petId) return
    navigate(`/pets/${petId}`)
  }

  if (loading) return <Loader label="Loading applications..." />

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">My Adoption Applications</h2>
      {applications.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-sm text-gray-600 shadow">
          No applications yet.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl bg-white shadow md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Pet Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied At</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{item.petName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => openView(item)}>
                          View Pet
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => adopt(item)}
                          disabled={!canAdopt(item.status)}
                        >
                          Adopt Now
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {applications.map((item) => (
              <article key={item.id} className="rounded-xl bg-white p-4 shadow">
                <p className="text-sm font-medium text-gray-900">{item.petName}</p>
                <div className="mt-2">
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => openView(item)}>
                    View Pet
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => adopt(item)}
                    disabled={!canAdopt(item.status)}
                  >
                    Adopt Now
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {viewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gray-100">
                {viewLoading ? (
                  <div className="p-8 text-sm text-gray-600">Loading...</div>
                ) : (
                  <img
                    src={viewPet?.image?.trim() || FALLBACK_PET_IMAGE}
                    alt={viewPet.name}
                    className="h-80 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_PET_IMAGE
                    }}
                  />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{viewPet?.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{viewPet?.breed}</p>
                  </div>
                  <button
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                    onClick={() => setViewOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-4">
                  {viewPet?.status ? <StatusBadge status={viewPet.status} /> : null}
                </div>
                <p className="mt-4 line-clamp-4 text-sm text-gray-700">
                  {viewPet?.description || 'No description provided.'}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <dt className="text-xs font-medium text-gray-500">Age</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {viewPet?.age ?? '-'} years
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3">
                    <dt className="text-xs font-medium text-gray-500">Species</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {viewPet?.species ?? '-'}
                    </dd>
                  </div>
                </dl>
                {viewError ? <p className="mt-4 text-sm text-red-500">{viewError}</p> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
