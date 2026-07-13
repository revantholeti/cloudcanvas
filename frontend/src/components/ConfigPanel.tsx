import { useState } from 'react'
import { type Node } from '@xyflow/react'
import { getComponentByType, type ConfigField } from '../lib/cloudComponents'
import { deriveFieldOverride, type FieldOverride } from '../lib/fieldDerivations'

interface ConfigPanelProps {
  node: Node
  allNodes: Node[]
  onUpdate: (nodeId: string, data: Partial<Record<string, unknown>>) => void
  onClose: () => void
}

// Walk parentId chain → ordered ancestor list (nearest first)
function getAncestors(node: Node, allNodes: Node[]): Node[] {
  const ancestors: Node[] = []
  let current = node
  while (current.parentId) {
    const parent = allNodes.find(n => n.id === current.parentId)
    if (!parent) break
    ancestors.push(parent)
    current = parent
  }
  return ancestors
}

// Collect inherited values per ancestor level, nearest-first
function collectInheritedByLevel(
  ancestors: Node[]
): { node: Node; keys: string[]; config: Record<string, unknown> }[] {
  return ancestors
    .map(ancestor => {
      const cfg = (ancestor.data.config as Record<string, unknown>) ?? {}
      const inherited = (ancestor.data.inheritedConfig as Record<string, unknown>) ?? {}
      const all = { ...inherited, ...cfg }
      const keys = Object.keys(all).filter(k => all[k] !== undefined && all[k] !== '')
      return { node: ancestor, keys, config: all }
    })
    .filter(a => a.keys.length > 0)
}

function TagsEditor({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')
  const entries = Object.entries(value)
  return (
    <div className="space-y-1">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-1">
          <span className="text-xs text-slate-300 bg-canvas-bg border border-canvas-border rounded px-2 py-1 flex-1 truncate">{k}={v}</span>
          <button onClick={() => { const next = { ...value }; delete next[k]; onChange(next) }}
            className="text-slate-500 hover:text-red-400 text-sm px-1">✕</button>
        </div>
      ))}
      <div className="flex gap-1">
        <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="key"
          className="w-24 bg-canvas-bg border border-canvas-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-primary" />
        <input value={newVal} onChange={(e) => setNewVal(e.target.value)} placeholder="value"
          className="flex-1 bg-canvas-bg border border-canvas-border rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-brand-primary" />
        <button onClick={() => {
          if (!newKey.trim()) return
          onChange({ ...value, [newKey.trim()]: newVal.trim() })
          setNewKey(''); setNewVal('')
        }} className="text-brand-primary hover:text-white text-sm px-1">+</button>
      </div>
    </div>
  )
}

function FieldControl({ fieldKey, field, value, override, onChange }: {
  fieldKey: string
  field: ConfigField
  value: unknown
  override: FieldOverride
  onChange: (key: string, value: unknown) => void
}) {
  const hasError = !!override.validationError
  const inputClass = `w-full bg-canvas-bg border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary ${hasError ? 'border-red-500' : 'border-canvas-border'}`
  const effectiveOptions = override.options ?? (field.options as string[] | undefined) ?? []

  if (field.type === 'select' || (field.type === 'text' && effectiveOptions.length > 0)) {
    return (
      <select value={String(value ?? '')} onChange={(e) => onChange(fieldKey, e.target.value)} className={inputClass}>
        {!field.required && <option value="">— select —</option>}
        {effectiveOptions.map((o) => (
          <option key={String(o)} value={String(o)}>{String(o)}</option>
        ))}
      </select>
    )
  }

  if (field.type === 'boolean') {
    return (
      <select value={String(value ?? false)} onChange={(e) => onChange(fieldKey, e.target.value === 'true')} className={inputClass}>
        <option value="true">Enabled</option>
        <option value="false">Disabled</option>
      </select>
    )
  }

  if (field.type === 'number') {
    return (
      <input
        type="number"
        min={field.min}
        max={field.max}
        defaultValue={value !== undefined && value !== '' ? String(value) : ''}
        placeholder={override.placeholder ?? field.placeholder}
        onBlur={(e) => onChange(fieldKey, e.target.value === '' ? '' : Number(e.target.value))}
        className={inputClass}
      />
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        defaultValue={String(value ?? '')}
        placeholder={override.placeholder ?? field.placeholder}
        onBlur={(e) => onChange(fieldKey, e.target.value)}
        rows={3}
        className={`${inputClass} resize-y font-mono text-xs`}
      />
    )
  }

  if (field.type === 'tags') {
    const tagVal = (typeof value === 'object' && value !== null) ? value as Record<string, string> : {}
    return <TagsEditor value={tagVal} onChange={(v) => onChange(fieldKey, v)} />
  }

  return (
    <input
      type="text"
      defaultValue={String(value ?? '')}
      placeholder={override.placeholder ?? field.placeholder}
      onBlur={(e) => onChange(fieldKey, e.target.value)}
      className={inputClass}
    />
  )
}

export default function ConfigPanel({ node, allNodes, onUpdate, onClose }: ConfigPanelProps) {
  const component = getComponentByType(node.data.componentType as string)
  if (!component) return null

  const config = (node.data.config as Record<string, unknown>) || {}
  const schema = component.configSchema ?? {}
  const hasSchema = Object.keys(schema).length > 0

  function handleChange(key: string, value: unknown) {
    onUpdate(node.id, { config: { ...config, [key]: value } })
  }

  // Build ancestor chain (nearest → root)
  const ancestors = getAncestors(node, allNodes)
  // Breadcrumb: root → ... → node (reversed ancestors + node)
  const breadcrumb = [...ancestors].reverse()

  // Inherited values grouped by ancestor
  const inheritedByLevel = collectInheritedByLevel(ancestors)

  // Dedupe: only show each key at the nearest level it appears
  const seenKeys = new Set<string>()
  const dedupedLevels = inheritedByLevel.map(level => {
    const uniqueKeys = level.keys.filter(k => !seenKeys.has(k))
    uniqueKeys.forEach(k => seenKeys.add(k))
    return { ...level, keys: uniqueKeys }
  }).filter(l => l.keys.length > 0)

  const schemaEntries = Object.entries(schema)
  const requiredEntries = schemaEntries.filter(([, f]) => f.required)
  const optionalEntries = schemaEntries.filter(([, f]) => !f.required)
  const allInherited = (node.data.inheritedConfig as Record<string, unknown>) ?? {}

  return (
    <div className="w-80 bg-canvas-surface border-l border-canvas-border flex flex-col h-full">

      {/* Header */}
      <div className="p-4 border-b border-canvas-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {component.iconUrl && (
            <img src={component.iconUrl} alt="" width={20} height={20} className="object-contain shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{component.label}</h3>
            <p className="text-xs text-slate-500 truncate">{component.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white shrink-0 ml-2 p-1 rounded hover:bg-canvas-bg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Hierarchy breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="px-4 py-2.5 border-b border-canvas-border bg-canvas-bg/40">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">Location</p>
          <div className="flex items-center flex-wrap gap-1">
            {breadcrumb.map((ancestor, i) => {
              const comp = getComponentByType(ancestor.data.componentType as string)
              return (
                <span key={ancestor.id} className="flex items-center gap-1">
                  {i > 0 && <span className="text-slate-600 text-xs">›</span>}
                  <span className="flex items-center gap-1 bg-canvas-surface border border-canvas-border rounded px-1.5 py-0.5">
                    {comp?.iconUrl && (
                      <img src={comp.iconUrl} alt="" width={10} height={10} className="object-contain shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <span className="text-[10px] text-slate-400 truncate max-w-[72px]">{ancestor.data.label as string}</span>
                  </span>
                </span>
              )
            })}
            <span className="text-slate-600 text-xs">›</span>
            <span className="flex items-center gap-1 bg-brand-primary/10 border border-brand-primary/30 rounded px-1.5 py-0.5">
              {component.iconUrl && (
                <img src={component.iconUrl} alt="" width={10} height={10} className="object-contain shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
              <span className="text-[10px] text-indigo-300 truncate max-w-[72px]">{node.data.label as string}</span>
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Display Label */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Display Label</label>
          <input
            defaultValue={node.data.label as string}
            onBlur={(e) => onUpdate(node.id, { label: e.target.value })}
            className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Inherited config grouped by ancestor */}
        {dedupedLevels.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Inherited from parents</p>
            <div className="space-y-2">
              {dedupedLevels.map(level => {
                const parentComp = getComponentByType(level.node.data.componentType as string)
                return (
                  <div key={level.node.id} className="rounded-lg border border-canvas-border overflow-hidden">
                    {/* Ancestor label */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-canvas-bg/60 border-b border-canvas-border">
                      {parentComp?.iconUrl && (
                        <img src={parentComp.iconUrl} alt="" width={11} height={11} className="object-contain shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      )}
                      <span className="text-[10px] font-medium text-slate-400 truncate">{level.node.data.label as string}</span>
                      <span className="text-[10px] text-slate-600 ml-auto">{parentComp?.label}</span>
                    </div>
                    {/* Inherited key/value rows */}
                    <div className="divide-y divide-canvas-border/40">
                      {level.keys.map(k => (
                        <div key={k} className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-canvas-bg/20">
                          <span className="text-[11px] text-slate-500 shrink-0">{k}</span>
                          <span className="text-[11px] text-slate-300 font-mono truncate">{String(level.config[k])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Config fields */}
        {hasSchema ? (
          <>
            {requiredEntries.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Required</p>
                <div className="space-y-3">
                  {requiredEntries.map(([key, field]) => {
                    const ov = deriveFieldOverride(component.type, key, config[key], allInherited)
                    return (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          {field.label}<span className="text-red-400 ml-0.5">*</span>
                        </label>
                        {(ov.description ?? field.description) && (
                          <p className="text-xs text-slate-500 mb-1">{ov.description ?? field.description}</p>
                        )}
                        <FieldControl fieldKey={key} field={field} value={config[key] ?? ''} override={ov} onChange={handleChange} />
                        {ov.validationError && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {ov.validationError}
                          </p>
                        )}
                        {ov.suggestedValue && !config[key] && (
                          <button onClick={() => handleChange(key, ov.suggestedValue!)}
                            className="text-xs text-brand-primary hover:underline mt-1">
                            Use suggested: {ov.suggestedValue}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {optionalEntries.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Configuration</p>
                <div className="space-y-3">
                  {optionalEntries.map(([key, field]) => {
                    const val = config[key] ?? component.defaultConfig[key] ?? ''
                    const ov = deriveFieldOverride(component.type, key, val, allInherited)
                    return (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-400 mb-1">{field.label}</label>
                        {(ov.description ?? field.description) && (
                          <p className="text-xs text-slate-500 mb-1">{ov.description ?? field.description}</p>
                        )}
                        <FieldControl fieldKey={key} field={field} value={val} override={ov} onChange={handleChange} />
                        {ov.validationError && (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {ov.validationError}
                          </p>
                        )}
                        {ov.suggestedValue && !config[key] && (
                          <button onClick={() => handleChange(key, ov.suggestedValue!)}
                            className="text-xs text-brand-primary hover:underline mt-1">
                            Use suggested: {ov.suggestedValue}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            {Object.entries({ ...component.defaultConfig, ...config }).map(([key, value]) => (
              <div key={key}>
                <label className="block text-xs text-slate-400 mb-1">{key}</label>
                {typeof value === 'boolean' ? (
                  <select defaultValue={String(value)} onBlur={(e) => handleChange(key, e.target.value === 'true')}
                    className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary">
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : (
                  <input defaultValue={String(value)} onBlur={(e) => handleChange(key, e.target.value)}
                    className="w-full bg-canvas-bg border border-canvas-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-primary" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
