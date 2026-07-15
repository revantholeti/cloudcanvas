import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ReactFlow, Background, Controls, MiniMap,
  useNodesState, useEdgesState,
  BackgroundVariant, ReactFlowProvider,
  type Node, type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import api from '../lib/api'
import CloudNode from '../components/CloudNode'
import ContainerNode from '../components/ContainerNode'
import { useAuthStore } from '../store/authStore'

const nodeTypes = { cloudNode: CloudNode, containerNode: ContainerNode }

const CSP_LABEL: Record<string, string> = {
  aws: '⚡ AWS', azure: '☁️ Azure', gcp: '🌐 GCP', multi: '🔀 Multi-cloud',
}

export default function SharedViewPage() {
  return (
    <ReactFlowProvider>
      <SharedViewInner />
    </ReactFlowProvider>
  )
}

function SharedViewInner() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [nodes, , onNodesChange] = useNodesState<Node>([])
  const [edges, , onEdgesChange] = useEdgesState<Edge>([])
  const [title, setTitle] = useState('')
  const [csp, setCsp] = useState('aws')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [diagramId, setDiagramId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api.get(`/public/diagrams/${token}`, { headers: { Authorization: undefined } })
      .then(({ data }) => {
        setTitle(data.title)
        setCsp(data.csp)
        setDiagramId(data.id)
        const g = data.graph_data || { nodes: [], edges: [] }
        onNodesChange(g.nodes.map((n: Node) => ({ type: 'add', item: n })))
        onEdgesChange(g.edges.map((e: Edge) => ({ type: 'add', item: e })))
      })
      .catch(() => setError('This diagram is not available or the link has expired.'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas-bg flex items-center justify-center">
        <div className="text-slate-400">Loading diagram…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas-bg flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔒</div>
        <p className="text-white text-xl font-semibold">Diagram not found</p>
        <p className="text-slate-400">{error}</p>
        <button onClick={() => navigate('/')} className="bg-brand-primary hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-sm mt-2">
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-canvas-bg">
      {/* Read-only header */}
      <header className="h-12 bg-canvas-surface border-b border-canvas-border flex items-center px-4 gap-4 shrink-0">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white text-sm">☁️ CloudCanvas</button>
        <div className="w-px h-5 bg-canvas-border" />
        <span className="text-white font-medium">{title}</span>
        <span className="text-xs bg-canvas-bg border border-canvas-border rounded-full px-2 py-0.5 text-slate-400">
          {CSP_LABEL[csp] ?? csp}
        </span>
        <span className="text-xs bg-amber-900/40 text-amber-300 border border-amber-700/40 rounded-full px-2 py-0.5">
          View only
        </span>
        <div className="flex-1" />
        {user && diagramId ? (
          <button
            onClick={() => navigate(`/canvas/${diagramId}`)}
            className="bg-brand-primary hover:bg-brand-hover text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            Open in editor →
          </button>
        ) : !user ? (
          <button
            onClick={() => navigate('/login')}
            className="bg-brand-primary hover:bg-brand-hover text-white px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            Sign in to edit
          </button>
        ) : null}
      </header>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        style={{ background: '#0f1117' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#2a2d3a" />
        <Controls style={{ background: '#1a1d27', border: '1px solid #2a2d3a' }} showInteractive={false} />
        <MiniMap style={{ background: '#1a1d27', border: '1px solid #2a2d3a' }} nodeColor="#6366f1" />
      </ReactFlow>
    </div>
  )
}
