import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { LogoFull } from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.access_token, data.user)
      navigate('/')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoFull size={32} className="justify-center text-app-text" />
          <p className="text-app-text-2">Design cloud architectures visually</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-app-surface border border-app-border rounded-xl p-8 space-y-4 shadow-sm">
          <h2 className="text-xl font-semibold text-app-text mb-6">Sign in</h2>
          <div>
            <label className="block text-sm text-app-text-2 mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-app-text-2 mb-1">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-app-text-3 hover:text-brand-primary">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-center text-app-text-2 text-sm">
            No account? <Link to="/register" className="text-brand-primary hover:underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
