import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { getComponentByType } from '../lib/cloudComponents'

const handleStyle = (color: string, visible: boolean) => ({
  background: color,
  width: 10,
  height: 10,
  opacity: visible ? 1 : 0,
  transition: 'opacity 0.15s',
})

export default memo(function CloudNode({ data, selected }: NodeProps) {
  const component = getComponentByType(data.componentType as string)
  const iconUrl = component?.iconUrl
  const fallbackEmoji = component?.icon ?? '📦'
  const color = component?.color ?? '#6366f1'
  const show = !!selected

  return (
    <div
      className={`bg-canvas-surface border-2 rounded-xl p-3 min-w-[120px] cursor-grab transition-all ${
        selected
          ? 'border-brand-primary shadow-lg shadow-brand-primary/20'
          : 'border-canvas-border hover:border-slate-500'
      }`}
    >
      <Handle type="source" position={Position.Top}    id="top"    style={handleStyle(color, show)} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle(color, show)} />
      <Handle type="source" position={Position.Left}   id="left"   style={handleStyle(color, show)} />
      <Handle type="source" position={Position.Right}  id="right"  style={handleStyle(color, show)} />

      <div className="flex flex-col items-center gap-1.5">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={component?.label}
            width={32}
            height={32}
            className="object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <span className="text-2xl">{fallbackEmoji}</span>
        )}
        <span className="text-xs text-white font-medium text-center leading-tight">
          {data.label as string}
        </span>
        {data.sublabel ? (
          <span className="text-xs text-slate-500">{data.sublabel as string}</span>
        ) : null}
      </div>
    </div>
  )
})
