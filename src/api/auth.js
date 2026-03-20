import api from './axios.js'
import { mockUsers } from '../data/mockData.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function buildAuthPayload(user) {
  return {
    token: `mock-token-${user.role}`,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  }
}

export async function loginUser(payload) {
  try {
    const response = await api.post('/auth/login', payload)
    return response.data
  } catch {
    await delay(450)
    const user = mockUsers.find(
      (item) =>
        item.email.toLowerCase() === payload.email.toLowerCase() &&
        item.password === payload.password,
    )
    if (!user) {
      throw new Error('Invalid email or password.')
    }
    return buildAuthPayload(user)
  }
}

export async function registerUser(payload) {
  const requestBody = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || 'user',
  }

  try {
    const response = await api.post('/auth/register', requestBody)
    return {
      token: response.data?.token,
      user: response.data?.user,
      message: response.data?.message,
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const apiMessage = error.response.data?.message
      if (status === 409) {
        throw new Error(apiMessage || 'Email is already registered.')
      }
      if (status === 400) {
        throw new Error(apiMessage || 'Validation failed. Please check your input.')
      }
      throw new Error(apiMessage || 'Registration failed.')
    }

    await delay(450)
    const alreadyExists = mockUsers.some(
      (item) => item.email.toLowerCase() === requestBody.email.toLowerCase(),
    )
    if (alreadyExists) {
      throw new Error('Email is already registered.')
    }
    const newUser = {
      id: `u${Date.now()}`,
      name: requestBody.name,
      email: requestBody.email,
      password: requestBody.password,
      role: requestBody.role,
    }
    mockUsers.push(newUser)
    return buildAuthPayload(newUser)
  }
}

export async function logoutUser() {
  try {
    const response = await api.post('/auth/logout')
    return response.data
  } catch {
    await delay(150)
    return { message: 'Logout successful.' }
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/users/me')
    const user = response.data?.user
    return user
      ? {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : null
  } catch {
    await delay(150)
    const raw = localStorage.getItem('pet_adoption_user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      id: parsed.id || parsed._id,
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    }
  }
}
