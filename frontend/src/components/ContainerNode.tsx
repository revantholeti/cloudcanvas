import { memo } from 'react'
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react'
import { getComponentByType, CONTAINER_COLORS } from '../lib/cloudComponents'

export default memo(function ContainerNode({ data, selected }: NodeProps) {
  const component = getComponentByType(data.componentType as string)
  const color = CONTAINER_COLORS[data.componentType as string] ?? component?.color ?? '#8C4FFF'
  const iconUrl = component?.iconUrl
  const fallbackEmoji = component?.icon ?? '📦'
  const show = !!selected

  const handleStyle = {
    background: color,
    width: 10,
    height: 10,
    opacity: show ? 1 : 0,
    transition: 'opacity 0.15s',
  }

  return (
    <>
      <NodeResizer
        minWidth={160}
        minHeight={120}
        isVisible={selected}
        lineStyle={{ borderColor: color, borderWidth: 1 }}
        handleStyle={{ borderColor: color, backgroundColor: '#1a1d27', width: 10, height: 10 }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          border: `2px dashed ${color}`,
          borderRadius: 12,
          backgroundColor: `${color}12`,
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={component?.label}
              width={18}
              height={18}
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <span style={{ fontSize: 14 }}>{fallbackEmoji}</span>
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color }}>{data.label as string}</span>
          {data.sublabel ? (
            <span style={{ fontSize: 10, color: '#94a3b8', marginLeft: 4 }}>{data.sublabel as string}</span>
          ) : null}
        </div>
      </div>

      <Handle type="source" position={Position.Top}    id="top"    style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Left}   id="left"   style={handleStyle} />
      <Handle type="source" position={Position.Right}  id="right"  style={handleStyle} />
    </>
  )
})
