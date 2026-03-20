import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Loader from './components/ui/Loader.jsx'
import ProtectedRoute from './router/ProtectedRoute.jsx'

const PublicLayout = lazy(() => import('./layouts/PublicLayout.jsx'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout.jsx'))
const PetsPage = lazy(() => import('./pages/public/PetsPage.jsx'))
const PetDetailsPage = lazy(() => import('./pages/public/PetDetailsPage.jsx'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage.jsx'))
const UserDashboardPage = lazy(() => import('./pages/user/UserDashboardPage.jsx'))
const UserPetsPage = lazy(() => import('./pages/user/UserPetsPage.jsx'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage.jsx'))
const AdminPetsPage = lazy(() => import('./pages/admin/AdminPetsPage.jsx'))
const AdminApplicationsPage = lazy(
  () => import('./pages/admin/AdminApplicationsPage.jsx'),
)

function App() {
  return (
    <Suspense fallback={<Loader fullscreen label="Loading page..." />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PetsPage />} />
          <Route path="/pets/:id" element={<PetDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboardPage />} />
          <Route path="pets" element={<UserPetsPage />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/pets"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/applications"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminApplicationsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
