import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPetById, getPets } from '../../api/pets.js'
import PetCard from '../../components/pets/PetCard.jsx'
import PetFilters from '../../components/pets/PetFilters.jsx'
import Button from '../../components/ui/Button.jsx'
import Loader from '../../components/ui/Loader.jsx'
import useDebounce from '../../hooks/useDebounce.js'

const FALLBACK_PET_IMAGE =
  'https://placedog.net/400/539?id=189'

export default function PetsPage() {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    species: '',
    breed: '',
    status: '',
    minAge: '',
    maxAge: '',
  })

  const debouncedSearch = useDebounce(filters.search, 350)
  const debouncedBreed = useDebounce(filters.breed, 350)

  useEffect(() => {
    async function loadPets() {
      setLoading(true)
      const query = {
        search: debouncedSearch || undefined,
        species: filters.species || undefined,
        breed: debouncedBreed || undefined,
        status: filters.status || undefined,
        minAge: filters.minAge || undefined,
        maxAge: filters.maxAge || undefined,
        page: pagination.page,
        limit: pagination.limit,
      }
      const data = await getPets(query)
      setPets(data?.pets || [])
      setPagination((prev) => ({
        ...prev,
        page: data?.page || prev.page,
        limit: data?.limit || prev.limit,
        total: data?.total || 0,
        totalPages: data?.totalPages || 1,
      }))
      setLoading(false)
    }
    loadPets()
  }, [
    debouncedBreed,
    debouncedSearch,
    filters.maxAge,
    filters.minAge,
    filters.species,
    filters.status,
    pagination.limit,
    pagination.page,
  ])

  const onFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const onViewPet = async (pet) => {
    setDetailsError('')
    setSelectedPet(pet)
    setDetailsOpen(true)
    setDetailsLoading(true)

    try {
      const details = await getPetById(pet.id)
      if (details) setSelectedPet(details)
    } catch (error) {
      setDetailsError(error.message || 'Failed to load pet details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Available Pets</h1>
        <p className="text-sm text-gray-600">Find your best friend and start the adoption process.</p>
      </div>
      <PetFilters filters={filters} onChange={onFilterChange} />
      {!loading ? (
        <p className="mb-4 text-sm text-gray-600">
          Showing {pets.length} pets (total: {pagination.total})
        </p>
      ) : null}
      {loading ? (
        <Loader label="Loading pets..." />
      ) : pets.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onView={onViewPet} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="text-sm text-gray-600">No pets found. Try changing your filters.</p>
        </div>
      )}

      {!loading && pagination.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(prev.page + 1, prev.totalPages),
              }))
            }
          >
            Next
          </Button>
        </div>
      ) : null}

      {detailsOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gray-100">
                {detailsLoading ? (
                  <div className="p-8 text-sm text-gray-600">Loading...</div>
                ) : (
                  <img
                    src={selectedPet?.image?.trim() || FALLBACK_PET_IMAGE}
                    alt={selectedPet.name}
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
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedPet?.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{selectedPet?.breed}</p>
                  </div>
                  <button
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                    onClick={() => setDetailsOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {selectedPet?.status ? (
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {selectedPet.status}
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 line-clamp-4 text-sm text-gray-700">
                  {selectedPet?.description || 'No description provided.'}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <dt className="text-xs font-medium text-gray-500">Age</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {selectedPet?.age ?? '-'} years
                    </dd>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-3">
                    <dt className="text-xs font-medium text-gray-500">Species</dt>
                    <dd className="mt-1 font-semibold text-gray-900">
                      {selectedPet?.species}
                    </dd>
                  </div>
                </dl>

                {detailsError ? (
                  <p className="mt-4 text-sm text-red-500">{detailsError}</p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setDetailsOpen(false)
                      if (selectedPet?.id) navigate(`/pets/${selectedPet.id}`)
                    }}
                  >
                    Adopt Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
