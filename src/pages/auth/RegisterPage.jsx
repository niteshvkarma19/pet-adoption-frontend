import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import InputField from '../../components/ui/InputField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    adminKey: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (!form.password.trim()) nextErrors.password = 'Password is required.'
    if (form.password && form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.'
    }
    if (!['user', 'admin'].includes(form.role)) {
      nextErrors.role = 'Please select a valid user type.'
    }
    if (form.role === 'admin' && form.adminKey !== 'Admin@123') {
      nextErrors.adminKey = 'Invalid admin key.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }
      await register(payload)
      navigate('/login', { replace: true })
    } catch (error) {
      setServerError(error.message || 'Registration failed.')
    }
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Create account</h1>
      <p className="mb-5 text-sm text-gray-500">Join and adopt your next companion.</p>
      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          label="Name"
          name="name"
          value={form.name}
          onChange={onChange}
          error={errors.name}
          placeholder="Your full name"
        />
        <InputField
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          error={errors.email}
          placeholder="you@example.com"
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          error={errors.password}
          placeholder="Min 6 characters"
        />
        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
            User Type
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={onChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          {errors.role ? <p className="mt-1 text-xs text-red-500">{errors.role}</p> : null}
        </div>
        {form.role === 'admin' ? (
          <InputField
            label="Admin Key"
            type="password"
            name="adminKey"
            value={form.adminKey}
            onChange={onChange}
            error={errors.adminKey}
            placeholder="Enter admin key"
          />
        ) : null}
        {serverError ? <p className="text-sm text-red-500">{serverError}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600">
          Login
        </Link>
      </p>
    </section>
  )
}
