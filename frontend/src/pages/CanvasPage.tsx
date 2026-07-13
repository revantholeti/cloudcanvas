import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow, Background, Controls, MiniMap, addEdge, ConnectionMode,
  useNodesState, useEdgesState, useReactFlow,
  type Connection, type Node, type Edge,
  BackgroundVariant, ReactFlowProvider,
  applyNodeChanges, applyEdgeChanges, type NodeChange, type EdgeChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useDiagramStore } from '../store/diagramStore'
import api from '../lib/api'
import toast from 'react-hot-toast'
import Sidebar from '../components/Sidebar'
import CloudNode from '../components/CloudNode'
import ContainerNode from '../components/ContainerNode'
import ConfigPanel from '../components/ConfigPanel'
import CloudEdge from '../components/EdgeToolbar'
import ExportMenu from '../components/ExportMenu'
import IaCModal from '../components/IaCModal'
import VersionHistoryDrawer from '../components/VersionHistoryDrawer'
import { getComponentByType, isContainerType } from '../lib/cloudComponents'
import { validateDrop, suggestParent } from '../lib/containerRules'

// ── Toolbar SVG icons ──────────────────────────────────────────────────────
const UndoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M3 13C5.5 7 11 4 17 6.5s8 9.5 5 15"/>
  </svg>
)
const RedoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6"/><path d="M21 13C18.5 7 13 4 7 6.5S-1 16 2 21"/>
  </svg>
)
const GridIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)
const HistoryIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>
  </svg>
)
const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
)
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>
    <path d="M19 3l.9 2.1L22 6l-2.1.9L19 9l-.9-2.1L16 6l2.1-.9z"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const LoaderIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)

const nodeTypes = { cloudNode: CloudNode, containerNode: ContainerNode }
const edgeTypes = { cloudEdge: CloudEdge }

const CONTAINER_LEVEL: Record<string, number> = {
  aws_region: 4, azurerm_region: 4, google_region: 4,
  aws_vpc: 3, azurerm_virtual_network: 3, google_compute_network: 3,
  aws_availability_zone: 2,
  aws_subnet: 1, azurerm_subnet: 1, google_compute_subnetwork: 1,
  aws_security_group: 1, azurerm_network_security_group: 1, google_compute_firewall: 1,
}

const INHERITABLE_FIELDS: Record<string, string[]> = {
  aws_region:             ['region'],
  azurerm_region:         ['location', 'resource_group_name'],
  google_region:          ['region', 'project'],
  aws_vpc:                ['vpc_id', 'cidr_block', 'region', 'instance_tenancy'],
  azurerm_virtual_network:['virtual_network_name', 'address_space', 'location', 'resource_group_name'],
  google_compute_network: ['network_name', 'region', 'project'],
  aws_availability_zone:  ['availability_zone', 'region'],
  aws_subnet:             ['subnet_id', 'subnet_cidr', 'availability_zone', 'vpc_id', 'region'],
  azurerm_subnet:         ['subnet_name', 'virtual_network_name', 'location', 'resource_group_name'],
  google_compute_subnetwork: ['subnetwork_name', 'region', 'network_name', 'project'],
}

const CSP_OPTIONS = [
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
  { value: 'multi', label: 'Multi-cloud' },
]

export default function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}

function CanvasInner() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [csp, setCsp] = useState('aws')
  const [title, setTitle] = useState('Untitled Diagram')
  const [saving, setSaving] = useState(false)
  const [iacFormat, setIacFormat] = useState('terraform')
  const [iacLoading, setIacLoading] = useState(false)
  const [iacResult, setIacResult] = useState<{ format: string; files: Record<string, string> } | null>(null)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)
  const { isDirty, markSaved, markDirty, pushSnapshot, undo, redo } = useDiagramStore()

  // Expose setEdges to window for the edge toolbar
  useEffect(() => {
    (window as any).__rfInstance = { setEdges }
  }, [setEdges])

  useEffect(() => {
    if (!id) return
    api.get(`/diagrams/${id}`).then(({ data }) => {
      setTitle(data.title)
      setCsp(data.csp)
      setShareToken(data.share_token ?? null)
      const g = data.graph_data || { nodes: [], edges: [] }
      setNodes(g.nodes || [])
      setEdges(g.edges || [])
    }).catch(() => {
      toast.error('Diagram not found')
      navigate('/')
    })
  }, [id])

  async function handleShare() {
    if (!id) return
    try {
      let token = shareToken
      if (!token) {
        const { data } = await api.post(`/diagrams/${id}/share`)
        token = data.share_token
        setShareToken(token)
      }
      await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`)
      toast.success('Share link copied!')
    } catch {
      toast.error('Failed to generate share link')
    }
  }

  // Keyboard handler for Ctrl+Z / Ctrl+Y
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const snap = undo()
        if (snap) { setNodes(snap.nodes); setEdges(snap.edges) }
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        const snap = redo()
        if (snap) { setNodes(snap.nodes); setEdges(snap.edges) }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, setNodes, setEdges])

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    const hasDelete = changes.some((c) => c.type === 'remove')
    if (hasDelete) {
      pushSnapshot(nodes, edges)
    } else {
      // Mark dirty on drag-end (position with dragging=false) or dimension change
      const hasMeaningfulChange = changes.some(
        (c) => (c.type === 'position' && c.dragging === false) || c.type === 'dimensions'
      )
      if (hasMeaningfulChange) markDirty()
    }
    onNodesChange(changes)
  }, [nodes, edges, onNodesChange, pushSnapshot, markDirty])

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    const hasDelete = changes.some((c) => c.type === 'remove')
    if (hasDelete) pushSnapshot(nodes, edges)
    else if (changes.some((c) => c.type === 'add')) markDirty()
    onEdgesChange(changes)
  }, [nodes, edges, onEdgesChange, pushSnapshot, markDirty])

  const onConnect = useCallback(
    (params: Connection) => {
      pushSnapshot(nodes, edges)
      setEdges((eds) => addEdge({
        ...params,
        type: 'cloudEdge',
        data: { edgeStyle: 'bezier', animated: true },
        style: { stroke: '#6366f1' },
      } as Edge, eds))
    },
    [setEdges, nodes, edges, pushSnapshot]
  )

  const { screenToFlowPosition, getNodes } = useReactFlow()

  // Walk parent chain and collect inherited config fields
  function collectInherited(parentId: string | undefined, liveNodes: ReturnType<typeof getNodes>): Record<string, unknown> {
    if (!parentId) return {}
    const parent = liveNodes.find(n => n.id === parentId)
    if (!parent) return {}
    const parentType = parent.data.componentType as string
    const fields = INHERITABLE_FIELDS[parentType] ?? []
    const parentConfig = (parent.data.config as Record<string, unknown>) ?? {}
    const parentInherited = (parent.data.inheritedConfig as Record<string, unknown>) ?? {}
    const combined = { ...parentInherited, ...parentConfig }
    const fromParent: Record<string, unknown> = {}
    for (const f of fields) {
      if (combined[f] !== undefined && combined[f] !== '') fromParent[f] = combined[f]
    }
    // Also inherit from grandparent
    const grandparent = collectInherited(parent.parentId as string | undefined, liveNodes)
    return { ...grandparent, ...fromParent }
  }

  const onDrop = useCallback(
    (e: React.DragEvent | DragEvent) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/cloudcanvas')
      if (!raw) return
      const component = JSON.parse(raw)

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY })

      idCounter.current += 1
      const nodeId = `${component.type}-${idCounter.current}`
      const isContainer = isContainerType(component.type)

      // Use getNodes() — returns actual rendered positions from React Flow's internal store,
      // not the stale React-state positions, so absolute-position math is accurate.
      const liveNodes = getNodes()

      // Walk the parentId chain using liveNodes to get absolute flow position
      function getAbsPos(nodeId: string): { x: number; y: number } | null {
        const node = liveNodes.find((n) => n.id === nodeId)
        if (!node) return null
        if (!node.parentId) return { x: node.position.x, y: node.position.y }
        const parentAbs = getAbsPos(node.parentId)
        if (!parentAbs) return { x: node.position.x, y: node.position.y }
        return { x: parentAbs.x + node.position.x, y: parentAbs.y + node.position.y }
      }

      // Find smallest container that contains dropPos, filtered by minLevel
      function findContainer(minLevel: number) {
        const candidates = liveNodes.filter((n) => {
          if (n.type !== 'containerNode') return false
          return (CONTAINER_LEVEL[n.data.componentType as string] ?? 1) > minLevel
        })
        let best: (typeof liveNodes)[0] | null = null
        let bestArea = Infinity
        for (const cn of candidates) {
          const abs = getAbsPos(cn.id)
          if (!abs) continue
          const w = (cn.measured?.width ?? (cn.style?.width as number) ?? (getComponentByType(cn.data.componentType as string)?.defaultWidth ?? 400))
          const h = (cn.measured?.height ?? (cn.style?.height as number) ?? (getComponentByType(cn.data.componentType as string)?.defaultHeight ?? 300))
          if (flowPos.x >= abs.x && flowPos.x <= abs.x + w && flowPos.y >= abs.y && flowPos.y <= abs.y + h) {
            const area = w * h
            if (area < bestArea) { best = cn; bestArea = area }
          }
        }
        return best
      }

      if (!isContainer) {
        const parent = findContainer(0)
        let leafPos = flowPos
        let leafParentId: string | undefined
        if (parent) {
          const parentType = parent.data.componentType as string
          const err = validateDrop(component.type, component.label, parentType)
          if (err) {
            const parents = suggestParent(component.type)
            const hint = parents.length ? ` Place it inside: ${parents.join(' or ')}.` : ''
            toast.error(err + hint, { duration: 4000 })
            return
          }
          const abs = getAbsPos(parent.id)!
          leafParentId = parent.id
          leafPos = { x: flowPos.x - abs.x - 60, y: flowPos.y - abs.y - 40 }
        }
        const inherited = collectInherited(leafParentId, liveNodes)
        const newNode: Node = {
          id: nodeId,
          type: 'cloudNode',
          position: leafPos,
          ...(leafParentId ? { parentId: leafParentId } : {}),
          data: {
            label: component.label,
            componentType: component.type,
            config: { ...component.defaultConfig },
            inheritedConfig: inherited,
          },
        }
        setNodes((nds) => [...nds, newNode])
        return
      }

      // Container drop
      const myLevel = CONTAINER_LEVEL[component.type] ?? 1
      const parent = findContainer(myLevel)
      const containerWidth = component.defaultWidth ?? 400
      const containerHeight = component.defaultHeight ?? 300
      let containerPos = { x: flowPos.x - containerWidth / 2, y: flowPos.y - 24 }
      let containerParentId: string | undefined
      if (parent) {
        const parentType = parent.data.componentType as string
        const err = validateDrop(component.type, component.label, parentType)
        if (err) {
          const parents = suggestParent(component.type)
          const hint = parents.length ? ` Place it inside: ${parents.join(' or ')}.` : ''
          toast.error(err + hint, { duration: 4000 })
          return
        }
        const abs = getAbsPos(parent.id)!
        containerParentId = parent.id
        containerPos = { x: flowPos.x - abs.x - containerWidth / 2, y: flowPos.y - abs.y - 24 }
      }
      const inherited = collectInherited(containerParentId, liveNodes)
      const newContainer: Node = {
        id: nodeId,
        type: 'containerNode',
        position: containerPos,
        style: { width: containerWidth, height: containerHeight },
        zIndex: -1,
        ...(containerParentId ? { parentId: containerParentId } : {}),
        data: {
          label: component.label,
          componentType: component.type,
          config: { ...component.defaultConfig },
          inheritedConfig: inherited,
        },
      }
      setNodes((nds) => {
        if (containerParentId) {
          // Parent must appear before child in array
          const parentIdx = nds.findIndex((n) => n.id === containerParentId)
          if (parentIdx >= 0) {
            const next = [...nds]
            next.splice(parentIdx + 1, 0, newContainer)
            return next
          }
        }
        return [newContainer, ...nds]
      })
    },
    [setNodes, screenToFlowPosition, getNodes]
  )

  // Native capture-phase drag listeners — must be after onDrop is defined
  useEffect(() => {
    const el = reactFlowWrapper.current
    if (!el) return
    const handleDragOver = (e: DragEvent) => { e.preventDefault() }
    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onDrop(e as unknown as React.DragEvent)
    }
    el.addEventListener('dragover', handleDragOver, true)
    el.addEventListener('drop', handleDrop, true)
    return () => {
      el.removeEventListener('dragover', handleDragOver, true)
      el.removeEventListener('drop', handleDrop, true)
    }
  }, [onDrop])

  async function save() {
    if (!id) return
    setSaving(true)
    try {
      await api.put(`/diagrams/${id}`, {
        title,
        csp,
        graph_data: { nodes, edges },
      })
      markSaved()
      toast.success('Saved')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function generateIaC() {
    if (!id) return
    setIacLoading(true)
    try {
      await save()
      const { data } = await api.post('/iac/generate', { diagram_id: id, format: iacFormat })
      setIacResult({ format: iacFormat, files: data.files })
    } catch {
      toast.error('IaC generation failed')
    } finally {
      setIacLoading(false)
    }
  }

  function updateNodeData(nodeId: string, newData: Partial<Record<string, unknown>>) {
    setNodes((nds) => {
      // Apply update to the target node first
      const updated = nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n)

      // Recompute inheritedConfig for all descendants of this node
      function recomputeInherited(allNodes: typeof updated, targetId: string): typeof updated {
        // Build a merged config for the updated node
        const target = allNodes.find(n => n.id === targetId)
        if (!target) return allNodes

        // Walk parent chain using allNodes to get inherited fields for a given node
        function getInherited(parentId: string | undefined): Record<string, unknown> {
          if (!parentId) return {}
          const parent = allNodes.find(n => n.id === parentId)
          if (!parent) return {}
          const parentType = parent.data.componentType as string
          const fields = INHERITABLE_FIELDS[parentType] ?? []
          const parentConfig = (parent.data.config as Record<string, unknown>) ?? {}
          const parentInherited = (parent.data.inheritedConfig as Record<string, unknown>) ?? {}
          const combined = { ...parentInherited, ...parentConfig }
          const result: Record<string, unknown> = {}
          for (const f of fields) {
            if (combined[f] !== undefined && combined[f] !== '') result[f] = combined[f]
          }
          return { ...getInherited(parent.parentId as string | undefined), ...result }
        }

        // Update every node that is a descendant of targetId
        return allNodes.map(n => {
          if (n.id === targetId) return n
          // Check if this node is a descendant of targetId
          let cur: string | undefined = n.parentId as string | undefined
          let isDescendant = false
          while (cur) {
            if (cur === targetId) { isDescendant = true; break }
            cur = allNodes.find(x => x.id === cur)?.parentId as string | undefined
          }
          if (!isDescendant) return n
          return { ...n, data: { ...n.data, inheritedConfig: getInherited(n.parentId as string | undefined) } }
        })
      }

      return recomputeInherited(updated, nodeId)
    })
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...newData } } : prev)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-canvas-bg">
      {/* Toolbar — single row, three zones */}
      <header className="h-13 bg-canvas-surface border-b border-canvas-border flex items-center px-3 gap-2 shrink-0" style={{height: '52px'}}>

        {/* LEFT: navigation + title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-sm px-2 py-1.5 rounded-lg hover:bg-canvas-border transition-colors shrink-0"
          >
            ← <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="w-px h-5 bg-canvas-border shrink-0" />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            placeholder="Untitled Diagram"
            className="bg-transparent text-white font-semibold text-sm focus:outline-none focus:bg-canvas-bg focus:px-2 rounded px-1 py-1 min-w-0 w-36 transition-all"
          />
          {/* CSP pills */}
          <div className="flex items-center gap-1 bg-canvas-bg rounded-lg p-0.5 border border-canvas-border shrink-0">
            {CSP_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setCsp(o.value)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  csp === o.value ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: canvas tools */}
        <div className="flex items-center gap-1 mx-auto shrink-0">
          <div className="flex items-center bg-canvas-bg border border-canvas-border rounded-lg p-0.5 gap-0.5">
            <button onClick={() => { const s = undo(); if (s) { setNodes(s.nodes); setEdges(s.edges) } }}
              className="text-slate-400 hover:text-white hover:bg-canvas-border p-2 rounded-md transition-colors" title="Undo (Ctrl+Z)">
              <UndoIcon />
            </button>
            <button onClick={() => { const s = redo(); if (s) { setNodes(s.nodes); setEdges(s.edges) } }}
              className="text-slate-400 hover:text-white hover:bg-canvas-border p-2 rounded-md transition-colors" title="Redo (Ctrl+Y)">
              <RedoIcon />
            </button>
          </div>
          <button onClick={() => setSnapToGrid((v) => !v)}
            className={`p-2 rounded-lg border transition-colors ${snapToGrid ? 'bg-brand-primary border-brand-primary text-white' : 'border-canvas-border text-slate-400 hover:text-white hover:bg-canvas-border'}`}
            title="Snap to grid">
            <GridIcon />
          </button>
          <button onClick={() => setShowVersions(v => !v)}
            className={`p-2 rounded-lg border transition-colors ${showVersions ? 'bg-brand-primary border-brand-primary text-white' : 'border-canvas-border text-slate-400 hover:text-white hover:bg-canvas-border'}`}
            title="Version history">
            <HistoryIcon />
          </button>
        </div>

        {/* RIGHT: actions */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* IaC */}
          <div className="flex items-center gap-0 border border-canvas-border rounded-lg overflow-hidden">
            <select
              value={iacFormat}
              onChange={(e) => setIacFormat(e.target.value)}
              className="bg-canvas-bg px-2 py-1.5 text-xs text-slate-300 focus:outline-none border-r border-canvas-border"
            >
              <option value="terraform">Terraform</option>
              <option value="cloudformation">CloudFormation</option>
              <option value="bicep">Bicep</option>
              <option value="pulumi_python">Pulumi (Python)</option>
              <option value="pulumi_typescript">Pulumi (TS)</option>
            </select>
            <button
              onClick={generateIaC} disabled={iacLoading}
              className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {iacLoading ? <><LoaderIcon /> Generating…</> : <><SparkleIcon /> Generate Code</>}
            </button>
          </div>

          <div className="w-px h-5 bg-canvas-border" />

          {/* Share + Export */}
          <button onClick={handleShare}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white border border-canvas-border hover:border-slate-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            title={shareToken ? 'Copy share link' : 'Create share link'}>
            <ShareIcon /> Share
          </button>
          <ExportMenu title={title} />

          <div className="w-px h-5 bg-canvas-border" />

          {/* Save */}
          {saving ? (
            <span className="flex items-center gap-1.5 text-slate-400 text-xs px-2">
              <LoaderIcon /> Saving…
            </span>
          ) : isDirty ? (
            <button
              onClick={save}
              className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Save
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-green-400 text-xs px-2 select-none">
              <CheckIcon /> Saved
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar csp={csp} />

        <div ref={reactFlowWrapper} className="flex-1 relative"
          onDragOver={(e) => e.preventDefault()}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            snapToGrid={snapToGrid}
            snapGrid={[16, 16]}
            connectionMode={ConnectionMode.Loose}
            fitView
            style={{ background: '#0f1117' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2d3a" />
            <Controls
              className="!bg-canvas-surface !border !border-canvas-border !rounded-xl !shadow-lg [&>button]:!bg-canvas-surface [&>button]:!border-canvas-border [&>button]:!text-slate-400 [&>button:hover]:!bg-canvas-bg [&>button:hover]:!text-white [&>button]:!fill-slate-400 [&>button:hover]:!fill-white"
            />
            <MiniMap
              style={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 12 }}
              nodeColor="#6366f1"
              maskColor="rgba(15,17,23,0.6)"
            />
          </ReactFlow>
        </div>

        {showVersions && id && (
          <VersionHistoryDrawer
            diagramId={id}
            onClose={() => setShowVersions(false)}
            onRestore={() => { setShowVersions(false); window.location.reload() }}
          />
        )}

        {selectedNode && !showVersions && (
          <ConfigPanel
            node={selectedNode}
            allNodes={nodes}
            onUpdate={updateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {iacResult && (
        <IaCModal
          format={iacResult.format}
          files={iacResult.files}
          onClose={() => setIacResult(null)}
        />
      )}
    </div>
  )
}
