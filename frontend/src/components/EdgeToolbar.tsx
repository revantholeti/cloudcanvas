import { useState, useRef, useEffect } from 'react'
import { type EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, getStraightPath, getSmoothStepPath, useReactFlow, MarkerType } from '@xyflow/react'

export default function CloudEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  data, selected, markerEnd, markerStart, style,
}: EdgeProps) {
  const edgeStyle = (data?.edgeStyle as string) || 'bezier'
  const animated = data?.animated !== false
  const showArrow = data?.showArrow !== false
  const showArrowBoth = !!(data?.showArrowBoth)
  const edgeColor = selected ? '#818cf8' : '#6366f1'
  const { setEdges } = useReactFlow()
  const [editingLabel, setEditingLabel] = useState(false)
  const [labelInput, setLabelInput] = useState((data?.label as string) || '')
  const labelInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingLabel) labelInputRef.current?.focus()
  }, [editingLabel])

  const [edgePath, labelX, labelY] =
    edgeStyle === 'straight'
      ? getStraightPath({ sourceX, sourceY, targetX, targetY })
      : edgeStyle === 'step'
      ? getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
      : getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  function updateEdge(patch: Record<string, unknown>) {
    setEdges((eds) =>
      eds.map((e) => e.id === id ? { ...e, data: { ...e.data, ...patch } } : e)
    )
  }

  const arrowMarker = { type: MarkerType.ArrowClosed, color: edgeColor }

  function toggleArrow() {
    const next = !showArrow
    setEdges((eds) =>
      eds.map((e) => e.id === id
        ? { ...e, markerEnd: next ? arrowMarker : undefined, markerStart: undefined, data: { ...e.data, showArrow: next, showArrowBoth: false } }
        : e
      )
    )
  }

  function toggleArrowBoth() {
    const next = !showArrowBoth
    setEdges((eds) =>
      eds.map((e) => e.id === id
        ? { ...e, markerEnd: arrowMarker, markerStart: next ? arrowMarker : undefined, data: { ...e.data, showArrow: true, showArrowBoth: next } }
        : e
      )
    )
  }

  function deleteEdge() {
    setEdges((eds) => eds.filter((e) => e.id !== id))
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: animated ? '6 3' : undefined,
        }}
      />

      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
            className="absolute pointer-events-none bg-canvas-surface border border-canvas-border text-xs text-slate-300 px-2 py-0.5 rounded-md nodrag nopan"
          >
            {data.label as string}
          </div>
        </EdgeLabelRenderer>
      )}

      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${(labelY as number) - 40}px)`, pointerEvents: 'all' }}
            className="absolute nodrag nopan"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-0.5 bg-canvas-surface border border-canvas-border rounded-lg px-1.5 py-1 shadow-xl">

              {/* Edge style buttons */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); updateEdge({ edgeStyle: 'bezier' }) }}
                title="Curved"
                className={`flex items-center justify-center w-7 h-6 rounded text-xs transition-colors ${edgeStyle === 'bezier' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-canvas-bg'}`}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 9 C4 9 10 1 13 1" strokeLinecap="round"/>
                </svg>
              </button>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); updateEdge({ edgeStyle: 'step' }) }}
                title="Step"
                className={`flex items-center justify-center w-7 h-6 rounded text-xs transition-colors ${edgeStyle === 'step' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-canvas-bg'}`}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 8 H7 V2 H13" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); updateEdge({ edgeStyle: 'straight' }) }}
                title="Straight"
                className={`flex items-center justify-center w-7 h-6 rounded text-xs transition-colors ${edgeStyle === 'straight' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-canvas-bg'}`}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="5" x2="13" y2="5" strokeLinecap="round"/>
                </svg>
              </button>

              <div className="w-px h-4 bg-canvas-border mx-0.5" />

              {/* Animate toggle */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); updateEdge({ animated: !animated }) }}
                title={animated ? 'Stop animation' : 'Animate'}
                className={`flex items-center justify-center w-7 h-6 rounded text-xs transition-colors ${animated ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-canvas-bg'}`}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 5 Q3.5 1 7 5 Q10.5 9 13 5" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Single arrow toggle */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); toggleArrow() }}
                title={showArrow ? 'Remove arrow' : 'Add arrow'}
                className={`flex items-center justify-center w-7 h-6 rounded text-xs transition-colors ${showArrow && !showArrowBoth ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-canvas-bg'}`}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="5" x2="10" y2="5" strokeLinecap="round"/>
                  <polyline points="7,2 10,5 7,8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
                </svg>
              </button>

              {/* Double arrow toggle */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); toggleArrowBoth() }}
                title={showArrowBoth ? 'Remove double arrow' : 'Add double arrow'}
                className={`flex items-center justify-center w-7 h-6 rounded text-xs transition-colors ${showArrowBoth ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-canvas-bg'}`}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <polyline points="4,2 1,5 4,8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
                  <line x1="1" y1="5" x2="13" y2="5" strokeLinecap="round"/>
                  <polyline points="10,2 13,5 10,8" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
                </svg>
              </button>

              {/* Label */}
              {editingLabel ? (
                <input
                  ref={labelInputRef}
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === 'Enter') { updateEdge({ label: labelInput }); setEditingLabel(false) }
                    if (e.key === 'Escape') setEditingLabel(false)
                  }}
                  onBlur={() => { updateEdge({ label: labelInput }); setEditingLabel(false) }}
                  placeholder="label…"
                  className="w-20 bg-canvas-bg border border-brand-primary rounded px-1.5 text-xs text-white focus:outline-none"
                />
              ) : (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setLabelInput((data?.label as string) || ''); setEditingLabel(true) }}
                  title="Add label"
                  className={`flex items-center justify-center w-7 h-6 rounded text-xs transition-colors font-medium ${data?.label ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-canvas-bg'}`}
                >
                  T
                </button>
              )}

              <div className="w-px h-4 bg-canvas-border mx-0.5" />

              {/* Delete */}
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); deleteEdge() }}
                title="Delete connection"
                className="flex items-center justify-center w-7 h-6 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
