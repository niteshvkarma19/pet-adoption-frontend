import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DashboardSidebar() {
  const { user } = useAuth()
  const baseItemClass =
    'flex shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium lg:w-full'
  const activeClass = `${baseItemClass} bg-blue-600 text-white`
  const idleClass = `${baseItemClass} text-gray-700 hover:bg-gray-100`

  return (
    <aside className="w-full border-b border-gray-200 bg-white p-4 shadow lg:static lg:w-64 lg:border-b-0 lg:border-r">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-blue-600">Dashboard</h2>
        </div>
        <p className="text-xs text-gray-500">{user?.role?.toUpperCase()} PANEL</p>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {user?.role === 'admin' ? (
          <>
            <NavLink
              to="/dashboard/admin"
              className={({ isActive }) => (isActive ? activeClass : idleClass)}
            >
              <span>Overview</span>
            </NavLink>
            <NavLink
              to="/dashboard/admin/pets"
              className={({ isActive }) => (isActive ? activeClass : idleClass)}
            >
              <span>Pets</span>
            </NavLink>
            <NavLink
              to="/dashboard/admin/applications"
              className={({ isActive }) => (isActive ? activeClass : idleClass)}
            >
              <span>Applications</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/dashboard/pets"
              end
              className={({ isActive }) => (isActive ? activeClass : idleClass)}
            >
              <span>Pet</span>
            </NavLink>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => (isActive ? activeClass : idleClass)}
            >
              <span>Applications</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}
