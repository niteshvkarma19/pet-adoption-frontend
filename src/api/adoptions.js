import api from './axios.js'
import { mockApplications, mockPets } from '../data/mockData.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function applyForAdoption(petId, userId) {
  // userId isn't required by the backend contract for POST /api/adoptions,
  // but we keep it for mock fallback to avoid changing UI code elsewhere.
  try {
    const response = await api.post('/adoptions', { petId })
    return response.data
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const apiMessage = error.response.data?.message

      if (status === 400) {
        throw new Error(apiMessage || 'Validation failed / pet already adopted.')
      }
      if (status === 401) {
        throw new Error(apiMessage || 'Unauthorized. Please login again.')
      }
      if (status === 403) {
        throw new Error(apiMessage || 'Forbidden.')
      }
      if (status === 404) {
        throw new Error(apiMessage || 'Pet not found.')
      }
      if (status === 409) {
        throw new Error(apiMessage || 'Duplicate application.')
      }

      throw new Error(apiMessage || 'Failed to apply for adoption.')
    }

    await delay(300)

    // Mock fallback: prevent duplicates per (user, pet).
    const pet = mockPets.find((p) => p.id === petId)
    const existing = mockApplications.find(
      (item) => item.petId === petId && item.userId === userId,
    )
    if (existing) {
      throw new Error('You have already submitted an application for this pet.')
    }

    const newItem = {
      id: `app${Date.now()}`,
      petId,
      userId,
      petName: pet?.name || 'Unknown',
      status: 'Pending',
    }
    mockApplications.push(newItem)
    return { message: 'Adoption request submitted.', application: newItem }
  }
}

export async function getMyAdoptions() {
  const userRaw = localStorage.getItem('pet_adoption_user')
  const user = userRaw ? JSON.parse(userRaw) : null
  const userId = user?.id

  try {
    const response = await api.get('/adoptions/me')
    const payload = response.data
    const apps = payload?.applications || []

    return apps.map((app) => ({
      id: app.id || app._id,
      status: app.status,
      createdAt: app.createdAt,
      petId: app.pet?._id || app.pet?.id || app.petId,
      petName: app.pet?.name || app.petName,
      pet: app.pet,
    }))
  } catch (error) {
    await delay(250)

    // Mock fallback based on current auth user.
    const apps = userId
      ? mockApplications.filter((a) => a.userId === userId)
      : mockApplications

    return apps.map((app) => {
      const pet = mockPets.find((p) => p.id === app.petId)
      return {
        id: app.id,
        status: String(app.status || 'pending').toLowerCase(),
        createdAt: app.createdAt,
        petId: app.petId,
        petName: app.petName || pet?.name,
        pet: pet
          ? {
              _id: pet.id,
              name: pet.name,
              status: pet.status,
            }
          : null,
      }
    })
  }
}

export async function getAllAdoptions() {
  try {
    const response = await api.get('/adoptions')
    const payload = response.data
    const apps = payload?.applications || []

    return apps.map((app) => ({
      id: app.id || app._id,
      status: String(app.status || '').toLowerCase(),
      user: app.user,
      pet: app.pet,
      userName: app.user?.name,
      userEmail: app.user?.email,
      petId: app.pet?._id || app.pet?.id,
      petName: app.pet?.name,
    }))
  } catch (error) {
    await delay(250)
    return mockApplications.map((app) => {
      const pet = mockPets.find((p) => p.id === app.petId)
      return {
        id: app.id,
        status: String(app.status || '').toLowerCase(),
        user: { _id: app.userId, name: 'User', email: 'user@example.com', role: 'user' },
        pet: pet ? { _id: pet.id, name: pet.name, status: pet.status } : null,
        userName: 'User',
        userEmail: 'user@example.com',
        petId: app.petId,
        petName: app.petName || pet?.name,
      }
    })
  }
}

export async function updateAdoptionStatus(id, status) {
  try {
    const response = await api.patch(`/adoptions/${id}/status`, { status })
    const app = response.data?.application || response.data
    return {
      id: app.id || app._id || id,
      status: String(app.status || status).toLowerCase(),
      raw: app,
    }
  } catch (error) {
    if (error.response) {
      const code = error.response.status
      const apiMessage = error.response.data?.message
      if (code === 400) throw new Error(apiMessage || 'Validation failed / pet already adopted.')
      if (code === 401) throw new Error(apiMessage || 'Not authorized, token missing.')
      if (code === 403) throw new Error(apiMessage || 'Forbidden: insufficient role.')
      if (code === 404) throw new Error(apiMessage || 'Application not found.')
      throw new Error(apiMessage || 'Failed to update application status.')
    }

    await delay(250)
    const target = mockApplications.find((a) => a.id === id)
    if (!target) throw new Error('Application not found.')
    target.status = status
    return { id: target.id, status: String(target.status).toLowerCase(), raw: target }
  }
}
