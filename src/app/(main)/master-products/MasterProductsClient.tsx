'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'
import { useLookups } from '@/hooks/useLookups'

interface MasterProduct {
  id: number
  code: string
  name: string
  activeIngredient: string
  category: string
  manufacturer: string
  unit: string
  description: string
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function MasterProductsClient() {
  const { getLabel, getByCategory, loading } = useLookups()
  const [data, setData] = useState<MasterProduct[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const limit = 20

  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formActiveIngredient, setFormActiveIngredient] = useState('')
  const [formCategory, setFormCategory] = useState('prescription')
  const [formManufacturer, setFormManufacturer] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [editingItem, setEditingItem] = useState<MasterProduct | null>(null)
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    const res = await fetch('/api/master-products').then(r => r.json())
    setData(res.data || [])
  }

  useEffect(() => { fetchData() }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q) && !item.activeIngredient.toLowerCase().includes(q)) return false
    if (categoryFilter && item.category !== categoryFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  function handleOpenModal() {
    setEditingItem(null)
    setFormCode('')
    setFormName('')
    setFormActiveIngredient('')
    setFormCategory('prescription')
    setFormManufacturer('')
    setFormUnit('')
    setFormDescription('')
    setShowModal(true)
  }

  function handleEdit(item: MasterProduct) {
    setEditingItem(item)
    setFormCode(item.code)
    setFormName(item.name)
    setFormActiveIngredient(item.activeIngredient)
    setFormCategory(item.category)
    setFormManufacturer(item.manufacturer)
    setFormUnit(item.unit)
    setFormDescription(item.description)
    setShowModal(true)
  }

  async function handleDelete(item: MasterProduct) {
    if (!confirm(`Xóa sản phẩm ${item.name} khỏi danh mục chung?`)) return
    try {
      await fetch(`/api/master-products/${item.id}`, { method: 'DELETE' })
    } catch { }
    fetchData()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingItem ? `/api/master-products/${editingItem.id}` : '/api/master-products'
      await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formCode,
          name: formName,
          activeIngredient: formActiveIngredient,
          category: formCategory,
          manufacturer: formManufacturer,
          unit: formUnit,
          description: formDescription,
        }),
      })
      setShowModal(false)
      setEditingItem(null)
      fetchData()
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageGuard permission="products:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Danh Mục Chung</h1>
        <p className="text-zinc-500 text-sm">Quản lý danh mục sản phẩm trung tâm — dùng chung cho tất cả nhà thuốc</p>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã SP, tên, hoạt chất..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Danh mục</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {getByCategory('product_category').map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <Can permission="products:write">
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={handleOpenModal}>+ Thêm vào danh mục chung</button>
          </Can>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã SP</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Hoạt chất</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Danh mục</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Nhà SX</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Đơn vị</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-mono text-xs">{item.code}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-zinc-600">{item.activeIngredient}</td>
                <td className="px-4 py-3 text-zinc-600">{loading ? '...' : getLabel('product_category', item.category)}</td>
                <td className="px-4 py-3 text-zinc-600">{item.manufacturer}</td>
                <td className="px-4 py-3 text-zinc-600">{item.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <Can permission="products:write">
                      <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEdit(item)}>Sửa</button>
                    </Can>
                    <Can permission="products:delete">
                      <button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDelete(item)}>Xóa</button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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
              <h2 className="font-semibold text-sm text-zinc-900">{editingItem ? 'Sửa sản phẩm' : 'Thêm vào danh mục chung'}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mã SP</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Ví dụ: MP-SP001" value={formCode} onChange={e => setFormCode(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tên sản phẩm</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập tên" value={formName} onChange={e => setFormName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Hoạt chất</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Hoạt chất" value={formActiveIngredient} onChange={e => setFormActiveIngredient(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Danh mục</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                    {getByCategory('product_category').map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Nhà SX</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhà SX" value={formManufacturer} onChange={e => setFormManufacturer(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Đơn vị</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Đơn vị" value={formUnit} onChange={e => setFormUnit(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Mô tả</label>
                <textarea className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" rows={2} placeholder="Mô tả (tuỳ chọn)" value={formDescription} onChange={e => setFormDescription(e.target.value)} />
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
