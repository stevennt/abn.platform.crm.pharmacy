'use client'

interface DonutChartProps {
  title: string
  data: { label: string; value: number; color: string }[]
  onSegmentClick?: (label: string) => void
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`
}

export default function DonutChart({ title, data, onSegmentClick }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) {
    return (
      <div className="bg-white border border-zinc-300 p-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
          Không có dữ liệu
        </div>
      </div>
    )
  }

  const cx = 100
  const cy = 100
  const r = 80
  const innerR = 50

  const segments = data.reduce<({ label: string; value: number; color: string; d: string; startAngle: number; endAngle: number })[]>((acc, d) => {
    const lastAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : 0
    const sliceAngle = (d.value / total) * 360
    const startAngle = lastAngle
    const endAngle = lastAngle + sliceAngle
    const outer = describeArc(cx, cy, r, startAngle, endAngle)
    const inner = describeArc(cx, cy, innerR, endAngle, startAngle)
    acc.push({ ...d, d: `${outer} ${inner} Z`, startAngle, endAngle })
    return acc
  }, [])

  return (
    <div className="bg-white border border-zinc-300 p-4">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">{title}</h3>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {segments.map(seg => (
            <path
              key={seg.label}
              d={seg.d}
              fill={seg.color}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSegmentClick?.(seg.label)}
            />
          ))}
          <circle cx={cx} cy={cy} r={innerR} fill="white" />
        </svg>
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          {data.map(d => (
            <div key={d.label} className="flex items-center gap-1 text-xs text-zinc-600">
              <span className="w-2.5 h-2.5 inline-block" style={{ backgroundColor: d.color }} />
              <span>{d.label}</span>
              <span className="font-medium text-zinc-900">({d.value.toLocaleString('vi-VN')})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
