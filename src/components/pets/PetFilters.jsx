import InputField from '../ui/InputField.jsx'

export default function PetFilters({ filters, onChange }) {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <InputField
          label="Search Name/Breed"
          name="search"
          value={filters.search}
          onChange={onChange}
          placeholder="Search pets..."
        />
        <InputField
          label="Breed"
          name="breed"
          value={filters.breed}
          onChange={onChange}
          placeholder="Labrador"
        />
        <div>
          <label htmlFor="species" className="mb-1 block text-sm font-medium text-gray-700">
            Species
          </label>
          <select
            id="species"
            name="species"
            value={filters.species}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="available">available</option>
            <option value="adopted">adopted</option>
          </select>
        </div>
        <InputField
          label="Min Age"
          type="number"
          name="minAge"
          value={filters.minAge}
          onChange={onChange}
          placeholder="0"
        />
        <InputField
          label="Max Age"
          type="number"
          name="maxAge"
          value={filters.maxAge}
          onChange={onChange}
          placeholder="10"
        />
      </div>
    </div>
  )
}
