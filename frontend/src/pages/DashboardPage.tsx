import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { LogoFull } from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

interface Diagram {
  id: string
  title: string
  csp: string
  is_public: boolean
  share_token: string | null
  created_at: string
  updated_at: string | null
}

const CSP_BADGE: Record<string, string> = {
  aws: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/20',
  azure: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20',
  gcp: 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/20',
  multi: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20',
}
const CSP_LABEL: Record<string, string> = {
  aws: '⚡ AWS', azure: '☁️ Azure', gcp: '🌐 GCP', multi: '🔀 Multi',
}

function DiagramCard({ diagram, onDelete, onDuplicate, onShare }: {
  diagram: Diagram
  onDelete: (id: string, e: React.MouseEvent) => void
  onDuplicate: (id: string, e: React.MouseEvent) => void
  onShare: (diagram: Diagram, e: React.MouseEvent) => void
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const date = new Date(diagram.updated_at || diagram.created_at)
  const timeAgo = (() => {
    const diff = Date.now() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return date.toLocaleDateString()
  })()

  return (
    <div
      onClick={() => navigate(`/canvas/${diagram.id}`)}
      className="bg-app-surface border border-app-border rounded-xl hover:border-brand-primary cursor-pointer transition-all group flex flex-col shadow-sm"
    >
      <div className="h-32 bg-app-raised flex items-center justify-center border-b border-app-border relative rounded-t-xl">
        <div className="text-4xl opacity-30">
          {diagram.csp === 'aws' ? '⚡' : diagram.csp === 'azure' ? '☁️' : diagram.csp === 'gcp' ? '🌐' : '🔀'}
        </div>
        {diagram.is_public && (
          <span className="absolute top-2 right-2 text-xs bg-green-500/10 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-500/20">
            Public
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-app-text group-hover:text-brand-primary transition-colors leading-snug">
            {diagram.title}
          </h3>
          <div ref={menuRef} className="relative shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
              className="text-app-text-3 hover:text-app-text opacity-0 group-hover:opacity-100 transition-all px-1 py-0.5 rounded hover:bg-app-raised text-lg leading-none"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-20 bg-app-surface border border-app-border rounded-lg shadow-xl py-1 w-40">
                <button onClick={e => { onDuplicate(diagram.id, e); setMenuOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-app-text-2 hover:bg-app-raised hover:text-app-text transition-colors">
                  Duplicate
                </button>
                <button onClick={e => { onShare(diagram, e); setMenuOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-app-text-2 hover:bg-app-raised hover:text-app-text transition-colors">
                  {diagram.is_public ? 'Copy share link' : 'Share'}
                </button>
                <div className="border-t border-app-border my-1" />
                <button onClick={e => { onDelete(diagram.id, e); setMenuOpen(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CSP_BADGE[diagram.csp] ?? CSP_BADGE.multi}`}>
            {CSP_LABEL[diagram.csp] ?? diagram.csp.toUpperCase()}
          </span>
          <span className="text-app-text-3 text-xs">{timeAgo}</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/diagrams').then(({ data }) => setDiagrams(data)).finally(() => setLoading(false))
  }, [])

  async function createDiagram() {
    try {
      const { data } = await api.post('/diagrams', { title: 'Untitled Diagram', csp: 'aws' })
      navigate(`/canvas/${data.id}`)
    } catch {
      toast.error('Failed to create diagram')
    }
  }

  async function deleteDiagram(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this diagram? This cannot be undone.')) return
    await api.delete(`/diagrams/${id}`)
    setDiagrams(prev => prev.filter(d => d.id !== id))
    toast.success('Diagram deleted')
  }

  async function duplicateDiagram(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const { data } = await api.post(`/diagrams/${id}/duplicate`)
      setDiagrams(prev => [data, ...prev])
      toast.success('Diagram duplicated')
    } catch {
      toast.error('Failed to duplicate')
    }
  }

  async function shareDiagram(diagram: Diagram, e: React.MouseEvent) {
    e.stopPropagation()
    try {
      let token = diagram.share_token
      if (!token) {
        const { data } = await api.post(`/diagrams/${diagram.id}/share`)
        token = data.share_token
        setDiagrams(prev => prev.map(d => d.id === diagram.id ? data : d))
      }
      const url = `${window.location.origin}/share/${token}`
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied!')
    } catch {
      toast.error('Failed to generate share link')
    }
  }

  const filtered = diagrams.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="border-b border-app-border bg-app-surface px-6 py-4 flex items-center justify-between">
        <LogoFull size={22} className="text-app-text" />
        <div className="flex items-center gap-3">
          <span className="text-app-text-2 text-sm">{user?.name}</span>
          <ThemeToggle />
          <button onClick={logout} className="text-app-text-2 hover:text-app-text text-sm transition-colors">Sign out</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-app-text">My Diagrams</h2>
            <p className="text-app-text-3 text-sm mt-1">{diagrams.length} diagram{diagrams.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={createDiagram}
            className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            + New Diagram
          </button>
        </div>

        {diagrams.length > 0 && (
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search diagrams…"
            className="w-full mb-6 bg-app-surface border border-app-border rounded-lg px-4 py-2 text-sm text-app-text placeholder-app-text-3 focus:outline-none focus:border-brand-primary"
          />
        )}

        {loading ? (
          <div className="text-app-text-2 text-center py-16">Loading…</div>
        ) : diagrams.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">☁️</div>
            <p className="text-app-text-2 mb-6 text-lg">No diagrams yet</p>
            <button onClick={createDiagram}
              className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-3 rounded-lg font-medium">
              Create your first diagram
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-app-text-3">No diagrams match "{search}"</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(d => (
              <DiagramCard
                key={d.id}
                diagram={d}
                onDelete={deleteDiagram}
                onDuplicate={duplicateDiagram}
                onShare={shareDiagram}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
