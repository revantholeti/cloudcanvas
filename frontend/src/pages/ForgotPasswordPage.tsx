import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import ThemeToggle from '../components/ThemeToggle'
import { LogoFull } from '../components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setSent(true)
      if (data.dev_token) setDevToken(data.dev_token)
    } catch {
      toast.error('Something went wrong. Please try again.')
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
        <div className="bg-app-surface border border-app-border rounded-xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl mb-2">📧</div>
              <h2 className="text-xl font-semibold text-app-text">Check your inbox</h2>
              <p className="text-app-text-2 text-sm">
                If an account exists for <span className="text-app-text font-medium">{email}</span>, we sent a password reset link.
              </p>
              {devToken && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-left">
                  <p className="text-amber-500 text-xs font-semibold mb-1">DEV MODE — no email service</p>
                  <p className="text-xs text-app-text-2 mb-1">Use this token to reset your password:</p>
                  <Link
                    to={`/reset-password?token=${devToken}`}
                    className="text-brand-primary text-xs hover:underline break-all"
                  >
                    /reset-password?token={devToken}
                  </Link>
                </div>
              )}
              <Link to="/login" className="block text-brand-primary text-sm hover:underline mt-4">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-app-text mb-1">Forgot password?</h2>
                <p className="text-app-text-2 text-sm mb-6">Enter your email and we'll send a reset link.</p>
              </div>
              <div>
                <label className="block text-sm text-app-text-2 mb-1">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-app-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="text-center text-app-text-2 text-sm">
                <Link to="/login" className="text-brand-primary hover:underline">Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
