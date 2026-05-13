'use client'

interface LineChartProps {
  title: string
  data: { label: string; value: number }[]
  onPointClick?: (label: string) => void
}

export default function LineChart({ title, data, onPointClick }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const w = 600
  const h = 200
  const padL = 50
  const padR = 20
  const padT = 20
  const padB = 30
  const chartW = w - padL - padR
  const chartH = h - padT - padB

  const points = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padT + chartH - (d.value / maxValue) * chartH,
    label: d.label,
    value: d.value,
  }))

  const yTicks = 4
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxValue / yTicks) * i)
  )

  return (
    <div className="bg-white border border-zinc-300 p-4">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">{title}</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {yLabels.map((val, _i) => {
          const y = padT + chartH - (val / maxValue) * chartH
          return (
            <g key={val}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e4e4e7" strokeWidth={1} />
              <text x={padL - 6} y={y + 3} textAnchor="end" className="text-[9px] fill-zinc-500">
                {val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}
              </text>
            </g>
          )
        })}

        <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#18181b" strokeWidth={2} strokeLinejoin="round" />

        {points.map(p => (
          <g key={p.label}>
            <circle
              cx={p.x} cy={p.y} r={4} fill="#18181b"
              className="cursor-pointer hover:r-6 transition-all"
              onClick={() => onPointClick?.(p.label)}
            />
            <circle
              cx={p.x} cy={p.y} r={10} fill="transparent"
              className="cursor-pointer"
              onClick={() => onPointClick?.(p.label)}
            />
          </g>
        ))}

        {points.filter((_, idx) => data.length <= 12 || idx % Math.ceil(data.length / 12) === 0).map((p, _idx) => (
          <text key={p.label} x={p.x} y={h - 6} textAnchor="middle" className="text-[8px] fill-zinc-500">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
