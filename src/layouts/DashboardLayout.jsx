import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../components/layout/DashboardSidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'

export default function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex-col lg:flex lg:flex-row">
      <DashboardSidebar />
      <div className="flex-1">
        <header className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">Pet Adoption Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{user?.role || ''}</p>
            </div>
            <Button variant="danger" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
