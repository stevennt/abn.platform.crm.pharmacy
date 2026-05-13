'use client'

interface BarChartProps {
  title: string
  data: { label: string; value: number; color?: string }[]
  onBarClick?: (label: string) => void
}

const defaultColors = [
  'bg-zinc-900',
  'bg-zinc-700',
  'bg-zinc-600',
  'bg-zinc-500',
  'bg-zinc-400',
]

export default function BarChart({ title, data, onBarClick }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <div className="bg-white border border-zinc-300 p-4">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, i) => {
          const pct = (item.value / maxValue) * 100
          const color = item.color || defaultColors[i % defaultColors.length]
          return (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-zinc-600 mb-1">
                <span>{item.label}</span>
                <span className="font-medium">{item.value.toLocaleString('vi-VN')}</span>
              </div>
              <button
                className="w-full h-6 block relative rounded-none overflow-hidden cursor-pointer focus:outline-none focus:ring-1 focus:ring-zinc-900"
                onClick={() => onBarClick?.(item.label)}
                title={`Xem chi tiết ${item.label}`}
              >
                <div
                  className={`h-full transition-all ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
