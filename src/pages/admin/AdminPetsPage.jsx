import { useEffect, useMemo, useState } from 'react'
import { addPet, getPetById, getPets, updatePet } from '../../api/pets.js'
import { uploadPetImage } from '../../api/uploads.js'
import Button from '../../components/ui/Button.jsx'
import InputField from '../../components/ui/InputField.jsx'
import Modal from '../../components/ui/Modal.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'

const FALLBACK_PET_IMAGE =
  'https://placedog.net/400/539?id=189'

export default function AdminPetsPage() {
  const [pets, setPets] = useState([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    breed: '',
    species: 'Dog',
    age: '',
    status: 'available',
    image: '',
    description: '',
  })
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingDetailsId, setLoadingDetailsId] = useState(null)
  const [initialEditForm, setInitialEditForm] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewPet, setViewPet] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewError, setViewError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadImageError, setUploadImageError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    species: '',
    status: '',
  })

  useEffect(() => {
    async function load() {
      const data = await getPets()
      const normalizedPets = Array.isArray(data)
        ? data
        : Array.isArray(data?.pets)
          ? data.pets
          : Array.isArray(data?.data)
            ? data.data
            : []
      setPets(normalizedPets)
    }
    load()
  }, [])

  const selectedDeletePet = useMemo(
    () => pets.find((item) => item.id === deleteId) ?? null,
    [deleteId, pets],
  )

  const filteredPets = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    return pets.filter((pet) => {
      const matchSearch =
        !search ||
        pet.name.toLowerCase().includes(search) ||
        pet.breed.toLowerCase().includes(search)
      const matchSpecies = !filters.species || pet.species === filters.species
      const matchStatus =
        !filters.status || String(pet.status || '').toLowerCase() === filters.status.toLowerCase()
      return matchSearch && matchSpecies && matchStatus
    })
  }, [filters.search, filters.species, filters.status, pets])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError('')
  }

  const resetForm = () => {
    setUploadingImage(false)
    setUploadImageError('')
    setForm({
      name: '',
      breed: '',
      species: 'Dog',
      age: '',
      status: 'available',
      image: '',
      description: '',
    })
    setEditId(null)
    setFormErrors({})
    setSubmitError('')
    setInitialEditForm(null)
    setIsFormOpen(false)
  }

  const validateForm = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    if (!form.breed.trim()) nextErrors.breed = 'Breed is required.'
    if (!form.species.trim()) nextErrors.species = 'Species is required.'
    if (form.age === '' || Number.isNaN(Number(form.age))) {
      nextErrors.age = 'Age is required.'
    } else if (!Number.isInteger(Number(form.age)) || Number(form.age) < 0) {
      nextErrors.age = 'Age must be an integer greater than or equal to 0.'
    }
    if (form.status && !['available', 'adopted'].includes(form.status.toLowerCase())) {
      nextErrors.status = 'Status must be available or adopted.'
    }
    // For add mode, require an uploaded image URL.
    if (!editId && !form.image.trim()) nextErrors.image = 'Image is required.'
    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    const payload = {
      name: form.name.trim(),
      breed: form.breed.trim(),
      species: form.species.trim(),
      age: Number(form.age),
      description: form.description.trim(),
      status: (form.status || 'available').toLowerCase(),
      image: form.image.trim(),
    }

    setSubmitting(true)
    setSubmitError('')

    if (editId) {
      const changedPayload = {}
      const baseline = initialEditForm || {}
      Object.entries(payload).forEach(([key, value]) => {
        if (String(baseline[key] ?? '') !== String(value ?? '')) {
          changedPayload[key] = value
        }
      })

      if (!Object.keys(changedPayload).length) {
        setSubmitting(false)
        resetForm()
        return
      }

      try {
        const response = await updatePet(editId, changedPayload)
        const petFromApi = response?.pet
        if (petFromApi) {
          setPets((prev) =>
            prev.map((item) =>
              item.id === editId || item._id === editId
                ? {
                    ...item,
                    ...petFromApi,
                    id: petFromApi.id || petFromApi._id || item.id,
                  }
                : item,
            ),
          )
        } else {
          setPets((prev) =>
            prev.map((item) => (item.id === editId ? { ...item, ...changedPayload } : item)),
          )
        }
        resetForm()
      } catch (error) {
        setSubmitError(error.message || 'Failed to update pet.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    try {
      const response = await addPet(payload)
      const petFromApi = response?.pet
      if (petFromApi) {
        const normalizedPet = {
          id: petFromApi.id || petFromApi._id || String(Date.now()),
          name: petFromApi.name,
          breed: petFromApi.breed,
          species: petFromApi.species,
          age: petFromApi.age,
          description: petFromApi.description || '',
          status: petFromApi.status || 'available',
          image:
            petFromApi.image ||
            'https://placedog.net/400/539?id=189',
        }
        setPets((prev) => [...prev, normalizedPet])
      }
      resetForm()
    } catch (error) {
      setSubmitError(error.message || 'Failed to add pet.')
    } finally {
      setSubmitting(false)
    }
  }

  const onEdit = async (pet) => {
    setLoadingDetailsId(pet.id)
    setSubmitError('')
    setUploadImageError('')
    setUploadingImage(false)
    try {
      const details = await getPetById(pet.id)
      const petDetails = details || pet
      setEditId(petDetails.id || petDetails._id || pet.id)
      setForm({
        name: petDetails.name || '',
        breed: petDetails.breed || '',
        species: petDetails.species || 'Dog',
        age: String(petDetails.age ?? ''),
        status: String(petDetails.status || 'available').toLowerCase(),
        image: petDetails.image || '',
        description: petDetails.description || '',
      })
      setInitialEditForm({
        name: petDetails.name || '',
        breed: petDetails.breed || '',
        species: petDetails.species || 'Dog',
        age: Number(petDetails.age ?? 0),
        description: petDetails.description || '',
        status: String(petDetails.status || 'available').toLowerCase(),
        image: petDetails.image || '',
      })
      setIsFormOpen(true)
    } catch (error) {
      setSubmitError(error.message || 'Failed to load pet details for edit.')
    } finally {
      setLoadingDetailsId(null)
    }
  }

  const onViewPet = async (pet) => {
    setViewError('')
    setViewPet(pet)
    setViewOpen(true)
    setViewLoading(true)

    try {
      const details = await getPetById(pet.id)
      if (details) setViewPet(details)
    } catch (error) {
      setViewError(error.message || 'Failed to load pet details.')
    } finally {
      setViewLoading(false)
    }
  }

  const onDelete = () => {
    setPets((prev) => prev.filter((item) => item.id !== deleteId))
    setDeleteId(null)
  }

  const onFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const onUploadImage = async (file) => {
    setUploadImageError('')

    if (!file) return
    const maxSizeBytes = 5 * 1024 * 1024
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']

    if (file.size > maxSizeBytes) {
      setUploadImageError('File too large. Max 5MB.')
      return
    }
    if (!file.type || !file.type.startsWith('image/')) {
      setUploadImageError('Only image files are allowed.')
      return
    }
    if (allowedTypes.length && file.type && !allowedTypes.includes(file.type)) {
      // Keep this permissive, but still reject non-standard image mimetypes from uploads.
      setUploadImageError('Invalid image type.')
      return
    }

    setUploadingImage(true)
    try {
      const data = await uploadPetImage(file)
      const imageUrl = data?.imageUrl
      if (!imageUrl) {
        throw new Error('Upload succeeded but no imageUrl returned.')
      }
      setForm((prev) => ({ ...prev, image: imageUrl }))
      setFormErrors((prev) => ({ ...prev, image: '' }))
    } catch (error) {
      setUploadImageError(error.message || 'Image upload failed.')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">Pet Management</h2>
        <Button
          onClick={() => {
            setEditId(null)
            setUploadImageError('')
            setUploadingImage(false)
            setForm({
              name: '',
              breed: '',
              species: 'Dog',
              age: '',
              status: 'available',
              image: '',
              description: '',
            })
            setIsFormOpen(true)
          }}
        >
          Add Pet
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow md:grid-cols-3">
        <InputField
          label="Search"
          name="search"
          value={filters.search}
          onChange={onFilterChange}
          placeholder="Name or breed"
        />
        <div>
          <label htmlFor="filter-species" className="mb-1 block text-sm font-medium text-gray-700">
            Species
          </label>
          <select
            id="filter-species"
            name="species"
            value={filters.species}
            onChange={onFilterChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
          </select>
        </div>
        <div>
          <label htmlFor="filter-status" className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="available">available</option>
            <option value="pending">pending</option>
            <option value="adopted">adopted</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Breed</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPets.map((pet) => (
              <tr key={pet.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{pet.name}</td>
                <td className="px-4 py-3">{pet.breed}</td>
                <td className="px-4 py-3">{pet.age}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={pet.status} />
                </td>
                <td className="flex gap-2 px-4 py-3">
                  <Button
                    onClick={() => onViewPet(pet)}
                    variant="primary"
                    disabled={viewLoading && viewPet?.id === pet.id}
                  >
                    {viewLoading && viewPet?.id === pet.id ? 'Loading...' : 'View'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onEdit(pet)}
                    disabled={loadingDetailsId === pet.id}
                  >
                    {loadingDetailsId === pet.id ? 'Loading...' : 'Edit'}
                  </Button>
                  <Button variant="danger" onClick={() => setDeleteId(pet.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {editId ? 'Edit Pet' : 'Add Pet'}
            </h3>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Name"
                name="name"
                value={form.name}
                onChange={onChange}
                error={formErrors.name}
              />
              <InputField
                label="Breed"
                name="breed"
                value={form.breed}
                onChange={onChange}
                error={formErrors.breed}
              />
              <div>
                <label htmlFor="species" className="mb-1 block text-sm font-medium text-gray-700">
                  Species
                </label>
                <select
                  id="species"
                  name="species"
                  value={form.species}
                  onChange={onChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.species ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
                {formErrors.species ? (
                  <p className="mt-1 text-xs text-red-500">{formErrors.species}</p>
                ) : null}
              </div>
              <InputField
                label="Age"
                type="number"
                name="age"
                value={form.age}
                onChange={onChange}
                error={formErrors.age}
              />
              <div>
                <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${formErrors.status ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="available">available</option>
                  <option value="adopted">adopted</option>
                </select>
                {formErrors.status ? (
                  <p className="mt-1 text-xs text-red-500">{formErrors.status}</p>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="pet-image" className="mb-1 block text-sm font-medium text-gray-700">
                  Pet Image
                </label>
                <input
                  id="pet-image"
                  name="pet-image"
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    onUploadImage(file)
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
                />
                {form.image ? (
                  <img
                    src={form?.image?.trim() || FALLBACK_PET_IMAGE}
                    alt="Pet preview"
                    className="mt-3 h-24 w-full rounded-lg object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_PET_IMAGE
                    }}
                  />
                ) : null}
                {uploadingImage ? (
                  <p className="mt-2 text-xs text-gray-600">Uploading image...</p>
                ) : null}
                {uploadImageError ? (
                  <p className="mt-2 text-xs text-red-500">{uploadImageError}</p>
                ) : null}
                {formErrors.image ? (
                  <p className="mt-2 text-xs text-red-500">{formErrors.image}</p>
                ) : null}
              </div>
              {submitError ? (
                <p className="md:col-span-2 text-sm text-red-500">{submitError}</p>
              ) : null}
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editId ? 'Update Pet' : 'Add Pet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
                    <h3 className="text-xl font-semibold text-gray-900">
                      {viewPet?.name}
                    </h3>
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

                <div className="mt-4 flex flex-wrap gap-2">
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
                    <dd className="mt-1 font-semibold text-gray-900">{viewPet?.species}</dd>
                  </div>
                </dl>

                {viewError ? (
                  <p className="mt-4 text-sm text-red-500">{viewError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={Boolean(deleteId)}
        title="Delete pet"
        description={`Delete ${selectedDeletePet?.name || 'this pet'} permanently?`}
        confirmText="Delete"
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </section>
  )
}
