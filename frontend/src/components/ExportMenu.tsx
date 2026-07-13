import { useState, useRef, useEffect } from 'react'
import { exportPng, exportSvg, exportPdf } from '../lib/exportDiagram'

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)

const PngIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const SvgIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
)

const PdfIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

export default function ExportMenu({ title }: { title: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium border border-canvas-border hover:border-slate-500 transition-colors">
        <DownloadIcon /> Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-canvas-surface border border-canvas-border rounded-lg overflow-hidden shadow-xl z-50 min-w-[130px]">
          {[
            { label: 'PNG Image', icon: <PngIcon />, action: () => exportPng(title) },
            { label: 'SVG Vector', icon: <SvgIcon />, action: () => exportSvg(title) },
            { label: 'PDF Document', icon: <PdfIcon />, action: () => exportPdf(title) },
          ].map(({ label, icon, action }) => (
            <button key={label} onClick={() => { action(); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-canvas-hover hover:text-white transition-colors flex items-center gap-2">
              {icon}{label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
