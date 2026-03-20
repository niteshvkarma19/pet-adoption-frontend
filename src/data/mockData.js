export const mockPets = [
  {
    id: '1',
    name: 'Max',
    breed: 'Golden Retriever',
    age: 3,
    species: 'Dog',
    status: 'Available',
    image:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
    description: 'Friendly and energetic dog that loves people and long walks.',
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'Persian',
    age: 2,
    species: 'Cat',
    status: 'Pending',
    image:
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=900&q=80',
    description: 'Calm indoor cat with gentle temperament and playful mood.',
  },
  {
    id: '3',
    name: 'Charlie',
    breed: 'Beagle',
    age: 4,
    species: 'Dog',
    status: 'Available',
    image:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
    description: 'Curious beagle that enjoys sniffing adventures and treats.',
  },
  {
    id: '4',
    name: 'Milo',
    breed: 'Siamese',
    age: 1,
    species: 'Cat',
    status: 'Available',
    image:
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80',
    description: 'Smart young cat who likes toys and climbing trees indoors.',
  },
  {
    id: '5',
    name: 'Daisy',
    breed: 'Labrador',
    age: 5,
    species: 'Dog',
    status: 'Adopted',
    image:
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=900&q=80',
    description: 'Well-trained labrador, ideal family companion and very loyal.',
  },
]

export const mockUsers = [
  { id: 'u1', name: 'User Demo', email: 'user@example.com', password: 'password123', role: 'user' },
  { id: 'a1', name: 'Admin Demo', email: 'admin@example.com', password: 'password123', role: 'admin' },
]

export const mockApplications = [
  { id: 'app1', petId: '1', userId: 'u1', petName: 'Max', status: 'Pending' },
  { id: 'app2', petId: '2', userId: 'u1', petName: 'Luna', status: 'Approved' },
  { id: 'app3', petId: '3', userId: 'u1', petName: 'Charlie', status: 'Rejected' },
]
