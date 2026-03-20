import { useEffect, useState } from 'react'
import { getAllAdoptions } from '../../api/adoptions.js'
import { getPets } from '../../api/pets.js'
import Loader from '../../components/ui/Loader.jsx'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      const [petsData, applications] = await Promise.all([getPets(), getAllAdoptions()])
      const pets = Array.isArray(petsData?.pets) ? petsData.pets : []
      const approved = applications.filter((item) => item.status === 'approved').length
      const pending = applications.filter((item) => item.status === 'pending').length
      setStats({
        totalPets: pets.length,
        totalApplications: applications.length,
        approved,
        pending,
      })
    }
    load()
  }, [])

  if (!stats) return <Loader label="Loading dashboard..." />

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Admin Overview</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total Pets', stats.totalPets],
          ['Total Applications', stats.totalApplications],
          ['Approved', stats.approved],
          ['Pending', stats.pending],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
