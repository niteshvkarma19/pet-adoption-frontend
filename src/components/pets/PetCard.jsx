import { Link } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge.jsx'
import Button from '../ui/Button.jsx'

const FALLBACK_PET_IMAGE =
  'https://placedog.net/400/539?id=189'

export default function PetCard({ pet, onView }) {
  const imageSrc = pet?.image?.trim() || FALLBACK_PET_IMAGE

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-0.5 hover:shadow-lg">
      <img
        src={imageSrc}
        alt={pet.name}
        className="h-52 w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = FALLBACK_PET_IMAGE
        }}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
            <p className="text-sm text-gray-600">{pet.breed}</p>
          </div>
          <StatusBadge status={pet.status} />
        </div>
        <p className="text-sm text-gray-600">
          Age: <span className="font-medium text-gray-800">{pet.age} years</span>
        </p>
        <p className="line-clamp-2 text-sm text-gray-600">
          {pet.description || 'No description provided.'}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="primary" onClick={() => onView?.(pet)}>
            View
          </Button>
          <Link
            to={`/pets/${pet.id}`}
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Adopt Now
          </Link>
        </div>
      </div>
    </article>
  )
}
