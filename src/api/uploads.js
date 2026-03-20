import api from './axios.js'

export async function uploadPetImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await api.post('/uploads/pets-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    if (error.response) {
      const status = error.response.status
      const apiMessage = error.response.data?.message
      if (status === 400) throw new Error(apiMessage || 'Invalid image upload.')
      if (status === 401) throw new Error(apiMessage || 'Unauthorized. Please login again.')
      if (status === 403) throw new Error(apiMessage || 'Forbidden. Admin access is required.')
      throw new Error(apiMessage || 'Image upload failed.')
    }

    // Offline/mock fallback: use a local blob URL so the UI can still show a preview.
    const imageUrl = URL.createObjectURL(file)
    return { imageUrl, publicId: null, message: 'Image uploaded successfully (mock).' }
  }
}

