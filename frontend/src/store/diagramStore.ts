import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'

interface Snapshot {
  nodes: Node[]
  edges: Edge[]
}

interface DiagramStore {
  diagramId: string | null
  title: string
  csp: string
  nodes: Node[]
  edges: Edge[]
  isDirty: boolean
  past: Snapshot[]
  future: Snapshot[]
  setDiagram: (id: string, title: string, csp: string, nodes: Node[], edges: Edge[]) => void
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  setTitle: (title: string) => void
  setCsp: (csp: string) => void
  markSaved: () => void
  markDirty: () => void
  pushSnapshot: (nodes: Node[], edges: Edge[]) => void
  undo: () => Snapshot | null
  redo: () => Snapshot | null
}

export const useDiagramStore = create<DiagramStore>((set, get) => ({
  diagramId: null,
  title: 'Untitled Diagram',
  csp: 'aws',
  nodes: [],
  edges: [],
  isDirty: false,
  past: [],
  future: [],
  setDiagram: (id, title, csp, nodes, edges) =>
    set({ diagramId: id, title, csp, nodes, edges, isDirty: false, past: [], future: [] }),
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  setTitle: (title) => set({ title, isDirty: true }),
  setCsp: (csp) => set({ csp }),
  markSaved: () => set({ isDirty: false }),
  markDirty: () => set({ isDirty: true }),
  pushSnapshot: (nodes, edges) => {
    const { past } = get()
    const snap = { nodes, edges }
    set({ past: [...past.slice(-49), snap], future: [] })
  },
  undo: () => {
    const { past, nodes, edges } = get()
    if (past.length === 0) return null
    const prev = past[past.length - 1]
    set({
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...get().future],
      nodes: prev.nodes,
      edges: prev.edges,
      isDirty: true,
    })
    return prev
  },
  redo: () => {
    const { future, nodes, edges } = get()
    if (future.length === 0) return null
    const next = future[0]
    set({
      future: future.slice(1),
      past: [...get().past, { nodes, edges }],
      nodes: next.nodes,
      edges: next.edges,
      isDirty: true,
    })
    return next
  },
}))
