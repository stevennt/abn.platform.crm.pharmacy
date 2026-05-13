'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'
import { useLookups } from '@/hooks/useLookups'

interface Promotion {
  id: number
  code: string
  name: string
  type: string
  value: number
  startDate: string
  endDate: string
  status: string
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function PromotionsClient() {
  const { getLabel, getByCategory, getColor } = useLookups()
  const [data, setData] = useState<Promotion[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const limit = 10

  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('discount')
  const [formValue, setFormValue] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formStatus, setFormStatus] = useState('active')
  const [editingItem, setEditingItem] = useState<Promotion | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/promotions')
      .then(r => r.json())
      .then(res => {
        const list: Promotion[] = Array.isArray(res) ? res : res.data || []
        setData(list)
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q)) return false
    if (typeFilter && item.type !== typeFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  function handleOpenModal() {
    setEditingItem(null)
    setFormCode('')
    setFormName('')
    setFormType('discount')
    setFormValue('')
    setFormStartDate('')
    setFormEndDate('')
    setFormStatus('active')
    setShowModal(true)
  }

  function handleEdit(item: Promotion) {
    setEditingItem(item)
    setFormCode(item.code)
    setFormName(item.name)
    setFormType(item.type)
    setFormValue(String(item.value))
    setFormStartDate(item.startDate ? item.startDate.slice(0, 10) : '')
    setFormEndDate(item.endDate ? item.endDate.slice(0, 10) : '')
    setFormStatus(item.status)
    setShowModal(true)
  }

  async function handleDelete(item: Promotion) {
    if (!confirm(`Xóa chương trình KM ${item.name}?`)) return
    try {
      await fetch(`/api/promotions/${item.id}`, { method: 'DELETE' })
    } catch { }
    const res = await fetch('/api/promotions').then(r => r.json())
    setData(Array.isArray(res) ? res : res.data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingItem ? `/api/promotions/${editingItem.id}` : '/api/promotions'
      await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formCode,
          name: formName,
          type: formType,
          value: parseFloat(formValue) || 0,
          startDate: formStartDate,
          endDate: formEndDate,
          status: formStatus,
        }),
      })
      setShowModal(false)
      setEditingItem(null)
      const res = await fetch('/api/promotions').then(r => r.json())
      setData(Array.isArray(res) ? res : res.data || [])
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageGuard permission="promotions:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Chương Trình Khuyến Mãi</h1>
        <p className="text-zinc-500 text-sm">Quản lý các chương trình khuyến mãi, giảm giá, voucher</p>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã KM, tên..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Loại</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {getByCategory('promotion_type').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {getByCategory('promotion_status').map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <Can permission="promotions:write">
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={handleOpenModal}>+ Thêm chương trình KM</button>
          </Can>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã KM</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá trị</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày bắt đầu</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày kết thúc</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-mono text-xs">{item.code}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-zinc-600">{getLabel('promotion_type', item.type)}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{item.type === 'discount' ? `${item.value}%` : formatVND(item.value)}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.startDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.endDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${getColor('promotion_status', item.status) ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {getLabel('promotion_status', item.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <Can permission="promotions:write">
                      <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEdit(item)}>Sửa</button>
                    </Can>
                    <Can permission="promotions:delete">
                      <button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDelete(item)}>Xóa</button>
                    </Can>
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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
              <h2 className="font-semibold text-sm text-zinc-900">{editingItem ? 'Sửa chương trình KM' : 'Thêm chương trình khuyến mãi'}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mã KM</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tự động" value={formCode} onChange={e => setFormCode(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tên</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tên chương trình" value={formName} onChange={e => setFormName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Loại</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formType} onChange={e => setFormType(e.target.value)}>
                    {getByCategory('promotion_type').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Giá trị</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" placeholder="0" value={formValue} onChange={e => setFormValue(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày bắt đầu</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày kết thúc</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                  {getByCategory('promotion_status').filter(l => l.isActive).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
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
