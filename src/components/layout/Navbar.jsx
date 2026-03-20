import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../ui/Button.jsx'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-blue-600">
          PetAdopt
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <NavLink to="/" className="text-sm text-gray-700 hover:text-blue-600">
            Pets
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink
                to={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard'}
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                Dashboard
              </NavLink>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm text-gray-700 hover:text-blue-600">
                Login
              </NavLink>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
