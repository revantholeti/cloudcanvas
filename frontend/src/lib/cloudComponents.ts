export interface ConfigField {
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'tags'
  options?: (string | number)[]
  description?: string
  placeholder?: string
  min?: number
  max?: number
  required?: boolean
}

export interface CloudComponent {
  type: string
  label: string
  category: string
  csp: 'aws' | 'azure' | 'gcp' | 'multi'
  iconUrl?: string
  icon?: string
  color: string
  isContainer?: boolean
  defaultWidth?: number
  defaultHeight?: number
  defaultConfig: Record<string, string | number | boolean>
  configSchema?: Record<string, ConfigField>
}

// Runtime cache populated from API
let _cache: Record<string, CloudComponent[]> = {}

// Color per CSP
const CSP_COLORS: Record<string, string> = {
  aws: '#FF9900',
  azure: '#0078D4',
  gcp: '#4285F4',
}

// Distinct colors per container type for visual hierarchy
export const CONTAINER_COLORS: Record<string, string> = {
  // AWS
  aws_region:            '#8B5CF6', // purple  – top-level boundary
  aws_vpc:               '#0EA5E9', // sky blue – network boundary
  aws_subnet:            '#10B981', // emerald  – sub-network
  aws_availability_zone: '#F59E0B', // amber    – infra grouping
  aws_ecs_cluster:       '#EC4899', // pink     – compute grouping
  aws_eks_cluster:       '#EC4899', // pink
  aws_auto_scaling_group:'#F97316', // orange
  // Azure
  azurerm_region:        '#8B5CF6',
  azurerm_virtual_network:'#0EA5E9',
  azurerm_subnet:        '#10B981',
  azurerm_kubernetes_cluster: '#EC4899',
  // GCP
  google_region:         '#8B5CF6',
  google_compute_network:'#0EA5E9',
  google_compute_subnetwork: '#10B981',
  google_container_cluster: '#EC4899',
}

// Fallback emoji per category
const CATEGORY_EMOJI: Record<string, string> = {
  Compute: '🖥️',
  Storage: '🪣',
  Database: '🗄️',
  Networking: '🌐',
  Security: '🛡️',
  Messaging: '📬',
  Analytics: '📊',
  ML: '🤖',
  DevTools: '🔧',
  Monitoring: '📡',
  Containers: '🐳',
}

export async function fetchComponents(csp: string): Promise<CloudComponent[]> {
  if (_cache[csp]) return _cache[csp]
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/components/${csp}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: any[] = await res.json()
    const comps: CloudComponent[] = data.map((c) => ({
      ...c,
      color: CONTAINER_COLORS[c.type] ?? CSP_COLORS[c.csp] ?? '#6366f1',
      icon: CATEGORY_EMOJI[c.category] ?? '📦',
    }))
    _cache[csp] = comps
    return comps
  } catch (e) {
    console.warn('Failed to load components from API, using empty list', e)
    return []
  }
}

export function getCachedComponents(csp: string): CloudComponent[] {
  if (csp === 'multi') return Object.values(_cache).flat()
  return _cache[csp] ?? []
}

export function getComponentByType(type: string): CloudComponent | undefined {
  return Object.values(_cache).flat().find((c) => c.type === type)
}

export function isContainerType(type: string): boolean {
  return getComponentByType(type)?.isContainer === true
}
