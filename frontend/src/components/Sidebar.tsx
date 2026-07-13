import { useState, useMemo, useEffect } from 'react'
import { fetchComponents, type CloudComponent } from '../lib/cloudComponents'

interface SidebarProps {
  csp: string
}

export default function Sidebar({ csp }: SidebarProps) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Compute', 'Storage', 'Networking']))
  const [components, setComponents] = useState<CloudComponent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchComponents(csp).then((comps) => {
      setComponents(comps)
      setLoading(false)
    })
  }, [csp])

  const filtered = useMemo(() => {
    if (!search) return components
    const q = search.toLowerCase()
    return components.filter(
      (c) => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
    )
  }, [components, search])

  const grouped = useMemo(() => {
    const map: Record<string, CloudComponent[]> = {}
    for (const c of filtered) {
      if (!map[c.category]) map[c.category] = []
      map[c.category].push(c)
    }
    return map
  }, [filtered])

  const categories = Object.keys(grouped).sort()

  function onDragStart(e: React.DragEvent, component: CloudComponent) {
    e.dataTransfer.setData('application/cloudcanvas', JSON.stringify(component))
    e.dataTransfer.effectAllowed = 'copy'
  }

  function toggleCategory(cat: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  return (
    <div className="w-64 bg-canvas-surface border-r border-canvas-border flex flex-col h-full">
      <div className="p-3 border-b border-canvas-border">
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="text-slate-500 text-xs text-center py-8">Loading components...</div>
        ) : categories.length === 0 ? (
          <div className="text-slate-500 text-xs text-center py-8">No components found</div>
        ) : (
          categories.map((cat) => (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-white transition-colors"
              >
                <span>{cat}</span>
                <span>{expanded.has(cat) ? '▾' : '▸'}</span>
              </button>
              {(expanded.has(cat) || !!search) && (
                <div className="space-y-0.5">
                  {grouped[cat].map((c) => (
                    <div
                      key={c.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, c)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-canvas-hover cursor-grab active:cursor-grabbing text-sm text-slate-300 hover:text-white transition-colors select-none"
                      title={c.type}
                    >
                      {c.iconUrl ? (
                        <img
                          src={c.iconUrl}
                          alt={c.label}
                          width={20}
                          height={20}
                          className="object-contain flex-shrink-0"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement
                            el.style.display = 'none'
                            const span = document.createElement('span')
                            span.textContent = c.icon ?? '📦'
                            span.style.fontSize = '16px'
                            el.parentNode?.insertBefore(span, el)
                          }}
                        />
                      ) : (
                        <span className="text-base w-5 text-center flex-shrink-0">{c.icon ?? '📦'}</span>
                      )}
                      <span className="truncate">{c.label}</span>
                      {c.isContainer && (
                        <span className="ml-auto text-[9px] text-slate-600 flex-shrink-0">group</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
