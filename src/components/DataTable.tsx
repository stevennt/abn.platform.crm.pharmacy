'use client'

interface Column {
  key: string
  label: string
  format?: (value: unknown) => string
}

interface DataTableProps {
  title: string
  columns: Column[]
  data: Record<string, unknown>[]
  onClose: () => void
}

export default function DataTable({ title, columns, data, onClose }: DataTableProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white border border-zinc-300 w-full max-w-3xl max-h-[80vh] flex flex-col mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-300 px-4 py-3">
          <h3 className="font-semibold text-sm text-zinc-900">{title}</h3>
          <button
            className="text-zinc-500 hover:text-zinc-900 text-sm px-2 py-1 border border-zinc-300"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
        <div className="overflow-auto flex-1">
          {data.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm">Không có dữ liệu</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-300">
                  {columns.map(col => (
                    <th key={col.key} className="text-left px-4 py-2 text-zinc-700 font-medium text-xs">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-200 hover:bg-zinc-50">
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-2 text-zinc-700 text-xs">
                        {col.format ? col.format(row[col.key]) : String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
