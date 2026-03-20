import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { applyForAdoption } from '../../api/adoptions.js'
import { getPetById } from '../../api/pets.js'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const FALLBACK_PET_IMAGE =
  'https://placedog.net/400/539?id=189'

export default function PetDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadPet() {
      setLoading(true)
      const data = await getPetById(id)
      setPet(data)
      setLoading(false)
    }
    loadPet()
  }, [id])

  const handleAdopt = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/pets/${id}` } })
      return
    }
    setSubmitting(true)
    try {
      await applyForAdoption(id, user.id)
      setMessage('Adoption request submitted successfully.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader label="Loading pet details..." />
  if (!pet) return <p className="rounded-lg bg-white p-4">Pet not found.</p>

  return (
    <section className="grid gap-6 rounded-2xl bg-white p-5 shadow md:grid-cols-2">
      <img
        src={pet?.image?.trim() || FALLBACK_PET_IMAGE}
        alt={pet.name}
        className="h-72 w-full rounded-xl object-cover md:h-full"
        onError={(event) => {
          event.currentTarget.src = FALLBACK_PET_IMAGE
        }}
      />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
          <StatusBadge status={pet.status} />
        </div>
        <p className="text-sm text-gray-600">{pet.description}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-gray-100 p-3">
            <dt className="text-gray-500">Breed</dt>
            <dd className="font-medium text-gray-800">{pet.breed}</dd>
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <dt className="text-gray-500">Age</dt>
            <dd className="font-medium text-gray-800">{pet.age} years</dd>
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <dt className="text-gray-500">Species</dt>
            <dd className="font-medium text-gray-800">{pet.species}</dd>
          </div>
          <div className="rounded-lg bg-gray-100 p-3">
            <dt className="text-gray-500">Status</dt>
            <dd className="font-medium text-gray-800">{pet.status}</dd>
          </div>
        </dl>
        <Button onClick={handleAdopt} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Adopt Now'}
        </Button>
        {message ? <p className="text-sm text-blue-600">{message}</p> : null}
      </div>
    </section>
  )
}
