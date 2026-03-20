import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar.jsx'

export default function PublicLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
