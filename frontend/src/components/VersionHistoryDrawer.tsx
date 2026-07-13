import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

interface Version {
  id: string
  diagram_id: string
  created_at: string
}

interface Props {
  diagramId: string
  onRestore: () => void
  onClose: () => void
}

export default function VersionHistoryDrawer({ diagramId, onRestore, onClose }: Props) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<string | null>(null)

  useEffect(() => {
    api.get(`/diagrams/${diagramId}/versions`)
      .then(({ data }) => setVersions(data))
      .catch(() => toast.error('Failed to load versions'))
      .finally(() => setLoading(false))
  }, [diagramId])

  async function restore(versionId: string) {
    if (!confirm('Restore this version? The current state will be saved as a new version first.')) return
    setRestoring(versionId)
    try {
      await api.post(`/diagrams/${diagramId}/versions/${versionId}/restore`)
      toast.success('Version restored — reloading diagram…')
      onRestore()
    } catch {
      toast.error('Failed to restore version')
    } finally {
      setRestoring(null)
    }
  }

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = Date.now()
    const diff = now - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return d.toLocaleString()
  }

  return (
    <div className="w-72 bg-canvas-surface border-l border-canvas-border flex flex-col h-full">
      <div className="p-4 border-b border-canvas-border flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-semibold text-white text-sm">Version History</h3>
          <p className="text-xs text-slate-500 mt-0.5">Auto-saved on every save</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-8">Loading…</div>
        ) : versions.length === 0 ? (
          <div className="text-slate-500 text-sm text-center py-8 px-4">
            No saved versions yet. Versions are created automatically each time you save.
          </div>
        ) : (
          <div className="divide-y divide-canvas-border">
            {versions.map((v, i) => (
              <div key={v.id} className="px-4 py-3 hover:bg-canvas-bg transition-colors group">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-white">
                      {i === 0 ? 'Latest save' : `Version ${versions.length - i}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(v.created_at)}</p>
                  </div>
                  <button
                    onClick={() => restore(v.id)}
                    disabled={restoring === v.id}
                    className="text-xs text-brand-primary hover:text-white opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 shrink-0 pt-0.5"
                  >
                    {restoring === v.id ? 'Restoring…' : 'Restore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
