// Dynamic field derivations: filters options, suggests values, validates based on inherited parent config

export interface FieldOverride {
  options?: string[]
  placeholder?: string
  description?: string
  suggestedValue?: string
  validationError?: string
}

// AZs available per AWS region
const AZ_BY_REGION: Record<string, string[]> = {
  'us-east-1':      ['us-east-1a', 'us-east-1b', 'us-east-1c', 'us-east-1d', 'us-east-1e', 'us-east-1f'],
  'us-east-2':      ['us-east-2a', 'us-east-2b', 'us-east-2c'],
  'us-west-1':      ['us-west-1a', 'us-west-1b'],
  'us-west-2':      ['us-west-2a', 'us-west-2b', 'us-west-2c', 'us-west-2d'],
  'eu-west-1':      ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
  'eu-west-2':      ['eu-west-2a', 'eu-west-2b', 'eu-west-2c'],
  'eu-west-3':      ['eu-west-3a', 'eu-west-3b', 'eu-west-3c'],
  'eu-central-1':   ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
  'eu-north-1':     ['eu-north-1a', 'eu-north-1b', 'eu-north-1c'],
  'ap-northeast-1': ['ap-northeast-1a', 'ap-northeast-1b', 'ap-northeast-1c', 'ap-northeast-1d'],
  'ap-northeast-2': ['ap-northeast-2a', 'ap-northeast-2b', 'ap-northeast-2c', 'ap-northeast-2d'],
  'ap-southeast-1': ['ap-southeast-1a', 'ap-southeast-1b', 'ap-southeast-1c'],
  'ap-southeast-2': ['ap-southeast-2a', 'ap-southeast-2b', 'ap-southeast-2c'],
  'ap-south-1':     ['ap-south-1a', 'ap-south-1b', 'ap-south-1c'],
  'sa-east-1':      ['sa-east-1a', 'sa-east-1b', 'sa-east-1c'],
  'ca-central-1':   ['ca-central-1a', 'ca-central-1b', 'ca-central-1d'],
  'me-south-1':     ['me-south-1a', 'me-south-1b', 'me-south-1c'],
  'af-south-1':     ['af-south-1a', 'af-south-1b', 'af-south-1c'],
}


// Parse CIDR: returns { network: number[], prefix: number } or null
function parseCidr(cidr: string): { octets: number[]; prefix: number } | null {
  const m = cidr.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/)
  if (!m) return null
  const octets = [+m[1], +m[2], +m[3], +m[4]]
  const prefix = +m[5]
  if (octets.some(o => o > 255) || prefix > 32) return null
  return { octets, prefix }
}

// Check if child CIDR is a subnet of parent CIDR
function isCidrSubnet(parent: string, child: string): boolean {
  const p = parseCidr(parent)
  const c = parseCidr(child)
  if (!p || !c) return false
  if (c.prefix < p.prefix) return false
  const mask = ~((1 << (32 - p.prefix)) - 1) >>> 0
  const pIp = ((p.octets[0] << 24) | (p.octets[1] << 16) | (p.octets[2] << 8) | p.octets[3]) >>> 0
  const cIp = ((c.octets[0] << 24) | (c.octets[1] << 16) | (c.octets[2] << 8) | c.octets[3]) >>> 0
  return (pIp & mask) === (cIp & mask)
}

// Suggest first few /24 subnets from a /16 CIDR, or /28 from a /24
function suggestSubnetCidrs(parentCidr: string, count = 4): string[] {
  const p = parseCidr(parentCidr)
  if (!p) return []
  const subnetPrefix = p.prefix <= 16 ? 24 : p.prefix <= 24 ? 28 : p.prefix + 2
  const base = ((p.octets[0] << 24) | (p.octets[1] << 16) | (p.octets[2] << 8) | p.octets[3]) >>> 0
  const size = 1 << (32 - subnetPrefix)
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    const ip = (base + i * size) >>> 0
    results.push(`${(ip >>> 24) & 0xff}.${(ip >>> 16) & 0xff}.${(ip >>> 8) & 0xff}.${ip & 0xff}/${subnetPrefix}`)
  }
  return results
}

export function deriveFieldOverride(
  componentType: string,
  fieldKey: string,
  currentValue: unknown,
  inheritedConfig: Record<string, unknown>
): FieldOverride {
  const region = inheritedConfig['region'] as string | undefined
  const vpcCidr = (inheritedConfig['cidr_block'] as string | undefined) ?? (inheritedConfig['subnet_cidr'] as string | undefined)
  const vnetAddressSpace = inheritedConfig['address_space'] as string | undefined

  // ── Availability Zone: filter to region's AZs ──────────────────────────────
  if (fieldKey === 'availability_zone' && region) {
    const azs = AZ_BY_REGION[region]
    if (azs) {
      const current = currentValue as string
      const validationError = current && !azs.includes(current)
        ? `"${current}" is not in region ${region}`
        : undefined
      return {
        options: azs,
        description: `AZs available in ${region}`,
        suggestedValue: azs[0],
        validationError,
      }
    }
  }

  // ── zone field on AZ container ──────────────────────────────────────────────
  if (fieldKey === 'zone' && region) {
    const azs = AZ_BY_REGION[region]
    if (azs) return { options: azs, description: `AZs in ${region}`, suggestedValue: azs[0] }
  }

  // ── Subnet CIDR: must be subset of VPC CIDR ────────────────────────────────
  if ((fieldKey === 'cidr_block') && (componentType === 'aws_subnet' || componentType === 'google_compute_subnetwork')) {
    if (vpcCidr) {
      const suggestions = suggestSubnetCidrs(vpcCidr)
      const current = currentValue as string
      const validationError = current && !isCidrSubnet(vpcCidr, current)
        ? `Must be a subnet of VPC CIDR ${vpcCidr}`
        : undefined
      return {
        placeholder: suggestions[0] ?? '',
        description: `Subnet of VPC CIDR ${vpcCidr}. Suggested: ${suggestions.join(', ')}`,
        suggestedValue: suggestions[0],
        validationError,
      }
    }
  }

  // ── VPC CIDR: inform about address space ────────────────────────────────────
  if (fieldKey === 'cidr_block' && (componentType === 'aws_vpc')) {
    return { placeholder: '10.0.0.0/16', description: 'IPv4 CIDR block for the VPC (e.g. 10.0.0.0/16)' }
  }

  // ── Azure subnet address prefix ─────────────────────────────────────────────
  if (fieldKey === 'address_prefixes' && componentType === 'azurerm_subnet') {
    if (vnetAddressSpace) {
      const suggestions = suggestSubnetCidrs(vnetAddressSpace)
      const current = currentValue as string
      const validationError = current && !isCidrSubnet(vnetAddressSpace, current)
        ? `Must be a subnet of VNet address space ${vnetAddressSpace}`
        : undefined
      return {
        placeholder: suggestions[0] ?? '',
        description: `Subnet of VNet address space ${vnetAddressSpace}`,
        validationError,
      }
    }
  }

  // ── Azure location: inherit from region ─────────────────────────────────────
  if (fieldKey === 'location' && inheritedConfig['location']) {
    const loc = inheritedConfig['location'] as string
    return { description: `Inherited from region: ${loc}`, suggestedValue: loc }
  }

  // ── Resource group: inherit ─────────────────────────────────────────────────
  if (fieldKey === 'resource_group_name' && inheritedConfig['resource_group_name']) {
    const rg = inheritedConfig['resource_group_name'] as string
    return { description: `Inherited from region group: ${rg}`, suggestedValue: rg }
  }

  // ── GCP project: inherit ────────────────────────────────────────────────────
  if (fieldKey === 'project' && inheritedConfig['project']) {
    const proj = inheritedConfig['project'] as string
    return { description: `Inherited from region: ${proj}`, suggestedValue: proj }
  }

  // ── EC2 subnet_id: show inherited subnet ────────────────────────────────────
  if (fieldKey === 'subnet_id' && inheritedConfig['subnet_id']) {
    return { description: `Subnet: ${inheritedConfig['subnet_id']}`, suggestedValue: inheritedConfig['subnet_id'] as string }
  }

  // ── EC2 vpc_security_group_ids: show VPC context ───────────────────────────
  if (fieldKey === 'vpc_security_group_ids' && inheritedConfig['vpc_id']) {
    return { description: `In VPC: ${inheritedConfig['vpc_id']}` }
  }

  return {}
}
