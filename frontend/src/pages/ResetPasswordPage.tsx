import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import ThemeToggle from '../components/ThemeToggle'
import { LogoFull } from '../components/Logo'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-app-text text-lg font-semibold">Invalid reset link</p>
          <Link to="/forgot-password" className="text-brand-primary text-sm hover:underline">
            Request a new one
          </Link>
        </div>
      </div>
    )
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
          <div>
            <h2 className="text-xl font-semibold text-app-text mb-1">Set new password</h2>
            <p className="text-app-text-2 text-sm mb-4">Choose a strong password for your account.</p>
          </div>
          <div>
            <label className="block text-sm text-app-text-2 mb-1">New password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-app-text-2 mb-1">Confirm password</label>
            <input
              type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8}
              className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-hover text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
          <p className="text-center text-app-text-2 text-sm">
            <Link to="/login" className="text-brand-primary hover:underline">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
