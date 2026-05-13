'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'

interface TaxSetting {
  id: number
  name: string
  rate: number
  type: string
  status: string
}

const typeLabels: Record<string, string> = {
  vat: 'VAT',
  import: 'Thuế nhập khẩu',
  special: 'Thuế tiêu thụ đặc biệt',
  other: 'Thuế khác',
}

export default function TaxClient() {
  const [data, setData] = useState<TaxSetting[]>([])
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const limit = 10

  const [formName, setFormName] = useState('')
  const [formRate, setFormRate] = useState('')
  const [formType, setFormType] = useState('vat')
  const [formStatus, setFormStatus] = useState('active')
  const [editingItem, setEditingItem] = useState<TaxSetting | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/tax')
      .then(r => r.json())
      .then(res => {
        const list: TaxSetting[] = Array.isArray(res) ? res : res.data || []
        setData(list)
      })
  }, [])

  const totalPages = Math.ceil(data.length / limit)
  const paged = data.slice((page - 1) * limit, page * limit)

  function handleOpenModal() {
    setEditingItem(null)
    setFormName('')
    setFormRate('')
    setFormType('vat')
    setFormStatus('active')
    setShowModal(true)
  }

  function handleEdit(item: TaxSetting) {
    setEditingItem(item)
    setFormName(item.name)
    setFormRate(String(item.rate))
    setFormType(item.type)
    setFormStatus(item.status)
    setShowModal(true)
  }

  async function handleDelete(item: TaxSetting) {
    if (!confirm(`Xóa thuế suất ${item.name}?`)) return
    try {
      await fetch(`/api/tax/${item.id}`, { method: 'DELETE' })
    } catch { }
    const res = await fetch('/api/tax').then(r => r.json())
    setData(Array.isArray(res) ? res : res.data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingItem ? `/api/tax/${editingItem.id}` : '/api/tax'
      await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          rate: parseFloat(formRate) || 0,
          type: formType,
          status: formStatus,
        }),
      })
      setShowModal(false)
      setEditingItem(null)
      const res = await fetch('/api/tax').then(r => r.json())
      setData(Array.isArray(res) ? res : res.data || [])
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageGuard permission="tax:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Quản Lý Thuế</h1>
        <p className="text-zinc-500 text-sm">Thiết lập các loại thuế và mức thuế suất</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng thuế suất</div>
          <div className="text-2xl font-bold text-zinc-900">{data.length}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đang áp dụng</div>
          <div className="text-2xl font-bold text-green-700">{data.filter(t => t.status === 'active').length}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Thuế VAT</div>
          <div className="text-2xl font-bold text-zinc-900">{data.filter(t => t.type === 'vat').length || 0}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Thuế NK</div>
          <div className="text-2xl font-bold text-zinc-900">{data.filter(t => t.type === 'import').length || 0}</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex justify-between items-center">
          <span className="text-sm text-zinc-700">Danh sách thuế suất</span>
          <Can permission="tax:write">
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={handleOpenModal}>+ Thêm thuế suất</button>
          </Can>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên thuế</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Thuế suất</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{item.rate}%</td>
                <td className="px-4 py-3 text-zinc-600">{typeLabels[item.type] || item.type}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'}`}>
                    {item.status === 'active' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <Can permission="tax:write">
                      <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEdit(item)}>Sửa</button>
                    </Can>
                    <Can permission="tax:delete">
                      <button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDelete(item)}>Xóa</button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-400">Chưa có thiết lập thuế</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-zinc-500">Trang {page}/{totalPages}</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`px-3 py-1 border text-sm ${p === page ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="px-3 py-1 border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">{editingItem ? 'Sửa thuế suất' : 'Thêm thuế suất'}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tên thuế</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="VD: VAT 10%" value={formName} onChange={e => setFormName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Thuế suất (%)</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" step="0.01" placeholder="10" value={formRate} onChange={e => setFormRate(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Loại thuế</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formType} onChange={e => setFormType(e.target.value)}>
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                    <option value="active">Đang áp dụng</option>
                    <option value="inactive">Ngừng áp dụng</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
              <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" onClick={handleSubmit} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageGuard>
  )
}
