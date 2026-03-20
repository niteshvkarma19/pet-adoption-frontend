import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import InputField from '../../components/ui/InputField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFormErrors((prev) => ({ ...prev, [name]: '' }))
    setError('')
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (!form.password.trim()) nextErrors.password = 'Password is required.'
    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!validate()) return
    try {
      const result = await login(form)
      const role = result?.user?.role
      const desiredPanel = role === 'admin' ? '/dashboard/admin' : '/dashboard'

      const from = location.state?.from
      const isTryingToOpenAdminArea = typeof from === 'string' && from.startsWith('/dashboard/admin')

      // If a non-admin tries to login from an admin-only route, always send them to the user panel.
      // Otherwise, keep the "return to where you came from" behavior (e.g. after hitting "Adopt Now").
      const nextPath =
        from && typeof from === 'string'
          ? role === 'admin'
            ? isTryingToOpenAdminArea
              ? from
              : desiredPanel
            : isTryingToOpenAdminArea
              ? desiredPanel
              : from
          : desiredPanel

      navigate(nextPath, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Login</h1>
      <p className="mb-5 text-sm text-gray-500">Welcome back to Pet Adoption.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          error={formErrors.email}
          placeholder="you@example.com"
        />
        <div>
          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={onChange}
            error={formErrors.password}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="mt-1 text-xs text-blue-600"
          >
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
        </div>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Do not have an account?{' '}
        <Link to="/register" className="text-blue-600">
          Register
        </Link>
      </p>
    </section>
  )
}
