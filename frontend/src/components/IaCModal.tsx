import { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js/lib/core'
import hclLang from 'highlight.js/lib/languages/ini'       // best available for HCL/Terraform
import yamlLang from 'highlight.js/lib/languages/yaml'
import jsonLang from 'highlight.js/lib/languages/json'
import pythonLang from 'highlight.js/lib/languages/python'
import typescriptLang from 'highlight.js/lib/languages/typescript'
import bashLang from 'highlight.js/lib/languages/bash'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('hcl', hclLang)
hljs.registerLanguage('yaml', yamlLang)
hljs.registerLanguage('json', jsonLang)
hljs.registerLanguage('python', pythonLang)
hljs.registerLanguage('typescript', typescriptLang)
hljs.registerLanguage('bash', bashLang)

function langForFile(filename: string): string {
  if (filename.endsWith('.tf') || filename.endsWith('.tfvars')) return 'hcl'
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml'
  if (filename.endsWith('.json')) return 'json'
  if (filename.endsWith('.py')) return 'python'
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript'
  if (filename.endsWith('.bicep')) return 'hcl'
  if (filename.endsWith('.sh')) return 'bash'
  return 'plaintext'
}

const FILE_ICONS: Record<string, string> = {
  '.tf': '🟣', '.tfvars': '🟣',
  '.yaml': '🟡', '.yml': '🟡',
  '.json': '🔵',
  '.py': '🟢',
  '.ts': '🔷',
  '.bicep': '🔵',
}

function fileIcon(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.'))
  return FILE_ICONS[ext] ?? '📄'
}

interface IaCModalProps {
  format: string
  files: Record<string, string>
  onClose: () => void
}

export default function IaCModal({ format, files, onClose }: IaCModalProps) {
  const fileNames = Object.keys(files)
  const [active, setActive] = useState(fileNames[0] ?? '')
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.removeAttribute('data-highlighted')
      hljs.highlightElement(codeRef.current)
    }
  }, [active, files])

  const currentContent = files[active] ?? ''

  function copyAll() {
    const combined = fileNames.map(f => `# ${f}\n${files[f]}`).join('\n\n')
    navigator.clipboard.writeText(combined)
  }

  function copyFile() {
    navigator.clipboard.writeText(currentContent)
  }

  function downloadAll() {
    const combined = fileNames.map(f => `# ${f}\n${files[f]}`).join('\n\n')
    const blob = new Blob([combined], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infrastructure.${format === 'cloudformation' ? 'yaml' : format === 'bicep' ? 'bicep' : 'tf'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatLabels: Record<string, string> = {
    terraform: 'Terraform HCL',
    cloudformation: 'CloudFormation',
    bicep: 'Azure Bicep',
    pulumi_python: 'Pulumi (Python)',
    pulumi_typescript: 'Pulumi (TypeScript)',
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div
        className="bg-[#0d1117] border border-[#30363d] rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#30363d] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold">{formatLabels[format] ?? format}</span>
            <span className="text-xs text-slate-500 bg-[#161b22] border border-[#30363d] rounded px-2 py-0.5">
              {fileNames.length} file{fileNames.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyFile}
              className="text-xs text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] px-3 py-1.5 rounded-lg transition-colors"
            >
              Copy file
            </button>
            <button
              onClick={copyAll}
              className="text-xs text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] px-3 py-1.5 rounded-lg transition-colors"
            >
              Copy all
            </button>
            <button
              onClick={downloadAll}
              className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              ↓ Download
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl ml-2">✕</button>
          </div>
        </div>

        {/* File tabs */}
        {fileNames.length > 1 && (
          <div className="flex items-center gap-1 px-4 pt-2 pb-0 border-b border-[#30363d] overflow-x-auto shrink-0">
            {fileNames.map(name => (
              <button
                key={name}
                onClick={() => setActive(name)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                  active === name
                    ? 'text-white border-indigo-500 bg-[#161b22]'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#161b22]'
                }`}
              >
                <span>{fileIcon(name)}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Code content */}
        <div className="flex-1 overflow-auto">
          <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d] text-xs text-slate-500">
            <span>{active}</span>
            <span>{currentContent.split('\n').length} lines</span>
          </div>
          <pre className="m-0 rounded-none bg-transparent overflow-visible text-sm leading-relaxed">
            <code
              ref={codeRef}
              className={`language-${langForFile(active)} block p-4 bg-transparent`}
            >
              {currentContent}
            </code>
          </pre>
        </div>
      </div>
    </div>
  )
}
