import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from '../components/ThemeToggle'
import { LogoFull, LogoMark } from '../components/Logo'

function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    drag: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
    cloud: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M18 10a6 6 0 00-11.47-1.47A4 4 0 006 16h12a4 4 0 000-8z"/><path d="M6 16a4 4 0 000 0"/>
        <circle cx="6.5" cy="16" r="0"/><path d="M6 16h2M16 16h2"/>
      </svg>
    ),
    hierarchy: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="4" rx="1"/><rect x="2" y="18" width="6" height="4" rx="1"/><rect x="9" y="18" width="6" height="4" rx="1"/><rect x="16" y="18" width="6" height="4" rx="1"/>
        <path d="M12 6v4M12 10H5v4M12 10h7v4"/>
      </svg>
    ),
    code: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="2" x2="12" y2="22"/>
      </svg>
    ),
    share: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    history: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
        <polyline points="12 7 12 12 15 15"/>
      </svg>
    ),
    validate: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    export: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  }
  return icons[name] ?? null
}

const FEATURES: { iconName: string; color: string; title: string; desc: string }[] = [
  {
    iconName: 'drag',
    color: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400',
    title: 'Visual Drag-and-Drop Designer',
    desc: 'Build professional cloud architecture diagrams in minutes. Drag components from a rich library onto your canvas — no coding, no fuss.',
  },
  {
    iconName: 'cloud',
    color: 'bg-sky-500/10 text-sky-500 dark:text-sky-400',
    title: 'Multi-Cloud Support',
    desc: 'Design for AWS, Azure, GCP, or mixed environments. Switch clouds without starting over — your diagram adapts.',
  },
  {
    iconName: 'hierarchy',
    color: 'bg-purple-500/10 text-purple-500 dark:text-purple-400',
    title: 'Smart Container Hierarchy',
    desc: 'Drop EC2 into a Subnet, nest Subnets inside VPCs, wrap everything in a Region. Components automatically inherit parent config.',
  },
  {
    iconName: 'code',
    color: 'bg-orange-500/10 text-orange-500 dark:text-orange-400',
    title: 'Generate Infrastructure Code',
    desc: 'Turn your diagram into production-ready Terraform, CloudFormation, Bicep, or Pulumi code in one click.',
  },
  {
    iconName: 'share',
    color: 'bg-green-500/10 text-green-500 dark:text-green-400',
    title: 'Share & Collaborate',
    desc: 'Share a read-only link with your team instantly. No account needed to view — just a URL.',
  },
  {
    iconName: 'history',
    color: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
    title: 'Version History',
    desc: 'Every save creates a snapshot. Browse and restore previous versions of your architecture anytime.',
  },
  {
    iconName: 'validate',
    color: 'bg-teal-500/10 text-teal-500 dark:text-teal-400',
    title: 'Validation & Config Inheritance',
    desc: 'Subnet CIDRs are validated against VPC ranges. Availability zones are filtered to the parent region. Config flows down the hierarchy automatically.',
  },
  {
    iconName: 'export',
    color: 'bg-pink-500/10 text-pink-500 dark:text-pink-400',
    title: 'Export in Multiple Formats',
    desc: 'Export your diagrams as PNG, SVG, or JSON. Use them in docs, Confluence, Notion, Jira — wherever your team works.',
  },
]

// bg color, svg path(s) for each component icon
const COMPONENTS: { label: string; bg: string; svg: JSX.Element }[] = [
  {
    label: 'EC2', bg: 'bg-orange-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12h6M12 9v6"/></svg>,
  },
  {
    label: 'Lambda', bg: 'bg-yellow-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round"><path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z"/></svg>,
  },
  {
    label: 'RDS', bg: 'bg-blue-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><ellipse cx="12" cy="7" rx="8" ry="3"/><path d="M4 7v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/></svg>,
  },
  {
    label: 'S3', bg: 'bg-green-600',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>,
  },
  {
    label: 'VPC', bg: 'bg-indigo-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="3"/><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>,
  },
  {
    label: 'EKS', bg: 'bg-blue-600',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>,
  },
  {
    label: 'ALB', bg: 'bg-orange-400',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 5v14M5 12h14"/><circle cx="5" cy="17" r="2"/><circle cx="12" cy="17" r="2"/><circle cx="19" cy="17" r="2"/><circle cx="12" cy="7" r="2"/></svg>,
  },
  {
    label: 'CloudFront', bg: 'bg-purple-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18"/></svg>,
  },
  {
    label: 'Route 53', bg: 'bg-purple-600',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  },
  {
    label: 'SQS', bg: 'bg-red-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  },
  {
    label: 'SNS', bg: 'bg-pink-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>,
  },
  {
    label: 'DynamoDB', bg: 'bg-blue-700',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v4c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 9v4c0 1.66 3.58 3 8 3s8-1.34 8-3V9"/><path d="M4 13v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4"/></svg>,
  },
  {
    label: 'ElastiCache', bg: 'bg-red-600',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 3C7 3 3 5.69 3 9v6c0 3.31 4 6 9 6s9-2.69 9-6V9c0-3.31-4-6-9-6z"/><path d="M3 9c0 3.31 4 6 9 6s9-2.69 9-6"/></svg>,
  },
  {
    label: 'Fargate', bg: 'bg-orange-600',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  },
  {
    label: 'API Gateway', bg: 'bg-teal-500',
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M12 3h7a2 2 0 012 2v14a2 2 0 01-2 2h-7M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h7M12 3v18M8 7h1M8 11h1M8 15h1"/></svg>,
  },
]

const STEPS = [
  { n: '01', title: 'Create a diagram', desc: 'Start from scratch or pick a cloud provider to get a pre-configured canvas.' },
  { n: '02', title: 'Drag & drop components', desc: 'Search 130+ AWS, Azure, and GCP components and place them on the canvas.' },
  { n: '03', title: 'Configure & connect', desc: 'Fill in config fields, connect services with edges, nest into containers.' },
  { n: '04', title: 'Generate & export', desc: 'Click "Generate Code" to get Terraform, CloudFormation or Pulumi. Export diagrams as PNG.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-sans">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-app-bg/80 backdrop-blur border-b border-app-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <LogoFull size={24} className="text-app-text" />
          <div className="flex items-center gap-2">
            <a href="#features" className="text-sm text-app-text-2 hover:text-app-text transition-colors hidden sm:block px-2">Features</a>
            <a href="#how" className="text-sm text-app-text-2 hover:text-app-text transition-colors hidden sm:block px-2">How it works</a>
            <a href="#components" className="text-sm text-app-text-2 hover:text-app-text transition-colors hidden sm:block px-2">Components</a>
            <ThemeToggle />
            {token ? (
              <button onClick={() => navigate('/')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
                Go to App →
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/login')}
                  className="text-sm text-app-text-2 hover:text-app-text px-3 py-2 transition-colors">
                  Sign in
                </button>
                <button onClick={() => navigate('/register')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
                  Get started free
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-300 text-xs px-3 py-1.5 rounded-full mb-6 font-medium">
            ✨ Multi-cloud · AI-powered code generation · Free to start
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-app-text">
            Design cloud<br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              architectures visually
            </span>
          </h1>
          <p className="text-xl text-app-text-2 max-w-2xl mx-auto mb-10 leading-relaxed">
            CloudCanvas is a browser-based diagram tool for cloud engineers. Drag, drop, and connect 130+ AWS, Azure, and GCP components — then generate production-ready infrastructure code instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-500/20">
              Start designing for free
            </button>
            <button onClick={() => navigate('/login')}
              className="w-full sm:w-auto border border-app-border hover:border-indigo-400 text-app-text-2 hover:text-app-text px-8 py-3.5 rounded-xl font-semibold text-lg transition-all">
              Sign in →
            </button>
          </div>
          <p className="text-app-text-3 text-sm mt-4">No credit card required · Free forever plan</p>
        </div>

        {/* Hero diagram preview — always dark (it's a canvas preview) */}
        <div className="relative max-w-5xl mx-auto mt-20">
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#1a1d27]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-slate-400 text-xs ml-2">My Production Architecture</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-0.5 rounded-full font-medium">AWS</span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Saved
                </span>
              </div>
            </div>
            {/* Canvas body */}
            <div className="relative h-96 bg-[#0f1117] overflow-hidden" style={{backgroundImage: 'radial-gradient(circle, #2a2d3a 1px, transparent 1px)', backgroundSize: '24px 24px'}}>

              {/* Region container */}
              <div className="absolute inset-5 border-2 border-dashed border-orange-500/50 rounded-xl bg-orange-500/[0.03]">
                <div className="absolute -top-3 left-3 flex items-center gap-1.5 bg-[#0f1117] px-2">
                  <div className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="white"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="8" cy="8" r="2" fill="white"/></svg>
                  </div>
                  <span className="text-orange-300 text-xs font-semibold">Region · us-east-1</span>
                </div>

                {/* VPC container */}
                <div className="absolute inset-4 top-5 border-2 border-dashed border-indigo-400/50 rounded-lg bg-indigo-500/[0.03]">
                  <div className="absolute -top-3 left-3 flex items-center gap-1.5 bg-[#0f1117] px-2">
                    <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5"/></svg>
                    </div>
                    <span className="text-indigo-300 text-xs font-semibold">VPC · 10.0.0.0/16</span>
                  </div>

                  <div className="absolute inset-3 top-5 flex gap-3">
                    {/* Subnet A */}
                    <div className="flex-1 border border-dashed border-purple-400/40 rounded-lg bg-purple-500/[0.03] p-2 pt-5 relative">
                      <div className="absolute -top-3 left-2 flex items-center gap-1 bg-[#0f1117] px-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-purple-500 flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2v12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                        <span className="text-purple-300 text-[10px] font-medium">Subnet A</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* EC2 node */}
                        <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                          <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="1.5"/><path d="M9 12h6M12 9v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </div>
                          <div>
                            <div className="text-white text-[10px] font-semibold leading-none">EC2 Instance</div>
                            <div className="text-slate-500 text-[9px] mt-0.5">t3.medium</div>
                          </div>
                        </div>
                        {/* Lambda node */}
                        <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                          <div className="w-7 h-7 rounded-md bg-yellow-500 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 3L5 13h7l-1 8 8-10h-7l1-8z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                          </div>
                          <div>
                            <div className="text-white text-[10px] font-semibold leading-none">Lambda</div>
                            <div className="text-slate-500 text-[9px] mt-0.5">Node.js 20</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subnet B */}
                    <div className="flex-1 border border-dashed border-purple-400/40 rounded-lg bg-purple-500/[0.03] p-2 pt-5 relative">
                      <div className="absolute -top-3 left-2 flex items-center gap-1 bg-[#0f1117] px-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-purple-500 flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2v12" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                        </div>
                        <span className="text-purple-300 text-[10px] font-medium">Subnet B</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* RDS node */}
                        <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                          <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="7" rx="8" ry="3" stroke="white" strokeWidth="1.5"/><path d="M4 7v10c0 1.66 3.58 3 8 3s8-1.34 8-3V7" stroke="white" strokeWidth="1.5"/></svg>
                          </div>
                          <div>
                            <div className="text-white text-[10px] font-semibold leading-none">RDS</div>
                            <div className="text-slate-500 text-[9px] mt-0.5">PostgreSQL 15</div>
                          </div>
                        </div>
                        {/* ElastiCache node */}
                        <div className="bg-[#1a1d27] border border-white/10 rounded-lg p-2 flex items-center gap-2 shadow-sm">
                          <div className="w-7 h-7 rounded-md bg-red-500 flex items-center justify-center shrink-0">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 3C7 3 3 5.69 3 9v6c0 3.31 4 6 9 6s9-2.69 9-6V9c0-3.31-4-6-9-6z" stroke="white" strokeWidth="1.5"/><path d="M3 9c0 3.31 4 6 9 6s9-2.69 9-6" stroke="white" strokeWidth="1.5"/></svg>
                          </div>
                          <div>
                            <div className="text-white text-[10px] font-semibold leading-none">ElastiCache</div>
                            <div className="text-slate-500 text-[9px] mt-0.5">Redis 7</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated code overlay */}
              <div className="absolute bottom-4 right-4 bg-[#1a1d27] border border-white/10 rounded-xl p-3 shadow-xl w-44">
                <p className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Generated</p>
                <p className="text-[11px] text-green-400 font-mono flex items-center gap-1"><span className="text-green-500">✓</span> main.tf</p>
                <p className="text-[11px] text-green-400 font-mono flex items-center gap-1"><span className="text-green-500">✓</span> variables.tf</p>
                <p className="text-[11px] text-green-400 font-mono flex items-center gap-1"><span className="text-green-500">✓</span> outputs.tf</p>
              </div>

              {/* Mini-map */}
              <div className="absolute bottom-4 left-4 bg-[#1a1d27]/80 border border-white/10 rounded-lg overflow-hidden w-20 h-14">
                <div className="w-full h-full relative">
                  <div className="absolute inset-1 border border-orange-500/30 rounded-sm" />
                  <div className="absolute inset-2 border border-indigo-500/30 rounded-sm" />
                  <div className="absolute bottom-2 right-2 w-8 h-4 bg-indigo-500/20 rounded-sm border border-indigo-500/30" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 inset-x-0 h-20 bg-gradient-to-t from-app-bg to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-app-text-3 text-sm mb-6 uppercase tracking-widest font-medium">Built for cloud engineers who ship fast</p>
          <div className="flex flex-wrap justify-center gap-8 text-app-text-2">
            {[['130+', 'Cloud components'], ['3', 'Clouds supported'], ['5', 'IaC formats'], ['∞', 'Diagrams free']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-extrabold text-app-text">{num}</div>
                <div className="text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-app-text">Everything you need to design cloud infrastructure</h2>
            <p className="text-app-text-2 text-lg max-w-2xl mx-auto">From blank canvas to deployable code — CloudCanvas handles the whole workflow.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-app-surface border border-app-border dark:border-white/5 rounded-2xl p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 transition-all group shadow-sm dark:shadow-none">
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <FeatureIcon name={f.iconName} />
                </div>
                <h3 className="font-semibold text-app-text mb-2 group-hover:text-indigo-500 transition-colors">{f.title}</h3>
                <p className="text-app-text-2 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-24 px-6 bg-app-bg dark:bg-app-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-app-text">From idea to infrastructure in minutes</h2>
            <p className="text-app-text-2 text-lg">No complex setup. No learning curve. Just open and design.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-500/30 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 font-bold text-lg mb-4">{s.n}</div>
                  <h3 className="font-semibold text-app-text mb-2">{s.title}</h3>
                  <p className="text-app-text-2 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Component library ── */}
      <section id="components" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-app-text">130+ cloud components, ready to drag</h2>
            <p className="text-app-text-2 text-lg max-w-2xl mx-auto">Every major AWS, Azure, and GCP service — with the right icons, config fields, and smart defaults.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {COMPONENTS.map((c) => (
              <div key={c.label} className="flex items-center gap-2 bg-app-surface border border-app-border dark:border-white/5 hover:border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-app-text-2 hover:text-app-text transition-all cursor-default shadow-sm dark:shadow-none">
                <div className={`w-6 h-6 rounded-md ${c.bg} flex items-center justify-center shrink-0`}>{c.svg}</div>
                {c.label}
              </div>
            ))}
            <div className="flex items-center gap-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-sm text-indigo-500 dark:text-indigo-300">
              + 115 more
            </div>
          </div>
        </div>
      </section>

      {/* ── IaC section ── */}
      <section className="py-24 px-6 bg-app-bg dark:bg-app-surface">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 text-xs px-3 py-1.5 rounded-full mb-6">⚡ AI-powered code generation</div>
            <h2 className="text-4xl font-bold mb-6 text-app-text">Your diagram <span className="text-purple-500">becomes code</span></h2>
            <p className="text-app-text-2 text-lg leading-relaxed mb-8">
              Click "Generate Code" and CloudCanvas sends your architecture to an AI that writes production-ready infrastructure code — understanding parent/child relationships, inherited configs, and your component settings.
            </p>
            <ul className="space-y-3">
              {['Terraform HCL', 'AWS CloudFormation', 'Azure Bicep', 'Pulumi Python', 'Pulumi TypeScript'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-app-text-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-500 text-xs">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          {/* Code preview — always dark (terminal aesthetic) */}
          <div className="bg-[#0f1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#1a1d27]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-slate-400 text-xs ml-2 font-mono">main.tf</span>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-300 leading-6 overflow-x-auto">{`resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = { Name = "main-vpc" }
}

resource "aws_subnet" "private" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.private.id
}`}</pre>
          </div>
        </div>
      </section>

      {/* ── Sharing section ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 bg-app-surface border border-app-border dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="text-xs text-app-text-3 mb-3 uppercase tracking-wider">Share link</div>
            <div className="flex items-center gap-3 bg-app-raised border border-app-border rounded-lg px-4 py-3 mb-4">
              <svg className="text-indigo-500 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              <span className="text-app-text-2 text-sm font-mono truncate">cloudcanvas.app/share/xK9mP2...</span>
              <span className="ml-auto text-xs bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Copied!</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['View only mode', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>],
                ['No login needed', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>],
                ['Always up to date', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>],
                ['Restore any version', <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/><polyline points="12 7 12 12 15 15"/></svg>],
              ] as [string, JSX.Element][]).map(([t, icon]) => (
                <div key={t} className="flex items-center gap-2 text-sm text-app-text-2">
                  <span className="text-app-text-3 shrink-0">{icon}</span>{t}
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-300 text-xs px-3 py-1.5 rounded-full mb-6">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share &amp; collaborate
            </div>
            <h2 className="text-4xl font-bold mb-6 text-app-text">Share your architecture with <span className="text-green-500">one link</span></h2>
            <p className="text-app-text-2 text-lg leading-relaxed">
              Generate a public share link and anyone can view your architecture — read-only, no account required. Version history means you can always roll back to a previous state.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 relative overflow-hidden bg-app-bg dark:bg-app-surface">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold mb-6 text-app-text">Start designing your cloud today</h2>
          <p className="text-app-text-2 text-xl mb-10">Free forever. No credit card. No setup. Just open the app and start building.</p>
          <button onClick={() => navigate('/register')}
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-500/20">
            Create your first diagram →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-app-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-app-text-3 text-sm flex items-center gap-1"><LogoMark size={16} />CloudCanvas · Design cloud architectures visually</div>
          <div className="flex items-center gap-6 text-sm text-app-text-3">
            <button onClick={() => navigate('/login')} className="hover:text-app-text transition-colors">Sign in</button>
            <button onClick={() => navigate('/register')} className="hover:text-app-text transition-colors">Register</button>
            <span>© 2026 CloudCanvas</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
