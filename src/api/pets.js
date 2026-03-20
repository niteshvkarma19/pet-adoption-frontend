import api from './axios.js'
import { mockPets } from '../data/mockData.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function normalizePet(pet) {
  return {
    ...pet,
    id: pet.id || pet._id,
  }
}

function applyLocalFiltersAndPagination(items, params) {
  const search = String(params.search || '').toLowerCase().trim()
  const species = String(params.species || '').toLowerCase().trim()
  const breed = String(params.breed || '').toLowerCase().trim()
  const status = String(params.status || '').toLowerCase().trim()
  const minAge = params.minAge !== undefined && params.minAge !== '' ? Number(params.minAge) : null
  const maxAge = params.maxAge !== undefined && params.maxAge !== '' ? Number(params.maxAge) : null
  const page = Math.max(Number(params.page) || 1, 1)
  const limit = Math.min(Math.max(Number(params.limit) || 10, 1), 100)

  const filtered = items.filter((pet) => {
    const petName = String(pet.name || '').toLowerCase()
    const petBreed = String(pet.breed || '').toLowerCase()
    const petSpecies = String(pet.species || '').toLowerCase()
    const petStatus = String(pet.status || '').toLowerCase()
    const petAge = Number(pet.age)

    const matchSearch = !search || petName.includes(search) || petBreed.includes(search)
    const matchSpecies = !species || petSpecies === species
    const matchBreed = !breed || petBreed.includes(breed)
    const matchStatus = !status || petStatus === status
    const matchMinAge = minAge === null || petAge >= minAge
    const matchMaxAge = maxAge === null || petAge <= maxAge

    return (
      matchSearch &&
      matchSpecies &&
      matchBreed &&
      matchStatus &&
      matchMinAge &&
      matchMaxAge
    )
  })

  const total = filtered.length
  const totalPages = Math.max(Math.ceil(total / limit), 1)
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * limit
  const pets = filtered.slice(start, start + limit)

  return {
    page: safePage,
    limit,
    total,
    totalPages,
    pets,
  }
}

export async function getPets(params = {}) {
  try {
    const response = await api.get('/pets', { params })
    const payload = response.data
    if (Array.isArray(payload)) {
      const normalizedPets = payload.map(normalizePet)
      return applyLocalFiltersAndPagination(normalizedPets, params)
    }
    const normalizedPets = Array.isArray(payload?.pets)
      ? payload.pets.map(normalizePet)
      : []
    return {
      page: payload?.page || Number(params.page) || 1,
      limit: payload?.limit || Number(params.limit) || 10,
      total: payload?.total ?? normalizedPets.length,
      totalPages: payload?.totalPages ?? 1,
      pets: normalizedPets,
    }
  } catch {
    await delay(300)
    return applyLocalFiltersAndPagination(mockPets.map(normalizePet), params)
  }
}

export async function getPetById(id) {
  try {
    const response = await api.get(`/pets/${id}`)
    const payload = response.data
    const pet = payload?.pet ?? payload
    if (!pet) return null
    return normalizePet(pet)
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const apiMessage = error.response.data?.message
      if (status === 400) {
        throw new Error(apiMessage || 'Invalid pet id.')
      }
      if (status === 404) {
        throw new Error(apiMessage || 'Pet not found.')
      }
      throw new Error(apiMessage || 'Failed to load pet details.')
    }
    await delay(250)
    return mockPets.find((pet) => pet.id === id || pet._id === id) ?? null
  }
}

export async function addPet(payload) {
  try {
    const response = await api.post('/pets', payload)
    return response.data
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const apiMessage = error.response.data?.message
      if (status === 400) {
        throw new Error(apiMessage || 'Validation failed. Please check pet details.')
      }
      if (status === 401) {
        throw new Error(apiMessage || 'Unauthorized. Please login again.')
      }
      if (status === 403) {
        throw new Error(apiMessage || 'Forbidden. Admin access is required.')
      }
      throw new Error(apiMessage || 'Failed to add pet.')
    }

    await delay(300)
    const mockPet = {
      id: String(Date.now()),
      ...payload,
      status: payload.status || 'available',
      image:
        payload.image ||
        'https://placedog.net/400/539?id=189',
    }
    mockPets.push(mockPet)
    return { message: 'Pet added successfully.', pet: mockPet }
  }
}

export async function updatePet(id, payload) {
  try {
    const response = await api.patch(`/pets/${id}`, payload)
    return response.data
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const apiMessage = error.response.data?.message
      if (status === 400) {
        throw new Error(apiMessage || 'Invalid id or validation failed.')
      }
      if (status === 401) {
        throw new Error(apiMessage || 'Unauthorized. Please login again.')
      }
      if (status === 403) {
        throw new Error(apiMessage || 'Forbidden. Admin access is required.')
      }
      if (status === 404) {
        throw new Error(apiMessage || 'Pet not found.')
      }
      throw new Error(apiMessage || 'Failed to update pet.')
    }

    await delay(200)
    const index = mockPets.findIndex((pet) => pet.id === id || pet._id === id)
    if (index === -1) {
      throw new Error('Pet not found.')
    }
    mockPets[index] = { ...mockPets[index], ...payload }
    return { message: 'Pet updated successfully.', pet: mockPets[index] }
  }
}
