'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'
import { useLookups } from '@/hooks/useLookups'

interface Product {
  id: number
  code: string
  name: string
  activeIngredient: string
  category: string
  manufacturer: string
  unit: string
  sellingPrice: number
  purchasePrice: number
  minStock: number
  stock: number
  status: string
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function ProductsClient() {
  const { getLabel, getByCategory, getColor, loading } = useLookups()
  const [data, setData] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [manufacturerFilter, setManufacturerFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [stats, setStats] = useState({ total: 0, selling: 0, expiring: 0, needPriceUpdate: 0 })
  const limit = 10

  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formActiveIngredient, setFormActiveIngredient] = useState('')
  const [formCategory, setFormCategory] = useState('prescription')
  const [formManufacturer, setFormManufacturer] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formSalePrice, setFormSalePrice] = useState('')
  const [formPurchasePrice, setFormPurchasePrice] = useState('')
  const [formMinStock, setFormMinStock] = useState('')
  const [formStatus, setFormStatus] = useState('active')
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(res => {
        const list: Product[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        setStats({
          total: list.length,
          selling: list.filter(p => p.status === 'active').length,
          expiring: list.filter(p => p.status === 'expiring').length,
          needPriceUpdate: list.filter(p => p.sellingPrice === 0).length,
        })
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.name.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q) && !item.activeIngredient.toLowerCase().includes(q)) return false
    if (categoryFilter && item.category !== categoryFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    if (manufacturerFilter && item.manufacturer !== manufacturerFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  const manufacturers = [...new Set(data.map(p => p.manufacturer).filter(Boolean))]

  function handleOpenModal() {
    setEditingItem(null)
    setFormCode('')
    setFormName('')
    setFormActiveIngredient('')
    setFormCategory('prescription')
    setFormManufacturer('')
    setFormUnit('')
    setFormSalePrice('')
    setFormPurchasePrice('')
    setFormMinStock('')
    setFormStatus('active')
    setShowModal(true)
  }

  function handleEdit(item: Product) {
    setEditingItem(item)
    setFormCode(item.code)
    setFormName(item.name)
    setFormActiveIngredient(item.activeIngredient)
    setFormCategory(item.category)
    setFormManufacturer(item.manufacturer)
    setFormUnit(item.unit)
    setFormSalePrice(String(item.sellingPrice))
    setFormPurchasePrice(String(item.purchasePrice))
    setFormMinStock(String(item.minStock))
    setFormStatus(item.status)
    setShowModal(true)
  }

  async function handleDelete(item: Product) {
    if (!confirm(`Xóa sản phẩm ${item.name}?`)) return
    try {
      await fetch(`/api/products/${item.id}`, { method: 'DELETE' })
    } catch { }
    const res = await fetch('/api/products').then(r => r.json())
    setData(Array.isArray(res) ? res : res.data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingItem ? `/api/products/${editingItem.id}` : '/api/products'
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
          sellingPrice: parseFloat(formSalePrice) || 0,
          purchasePrice: parseFloat(formPurchasePrice) || 0,
          minStock: parseInt(formMinStock) || 0,
          status: formStatus,
        }),
      })
      setShowModal(false)
      setEditingItem(null)
      const res = await fetch('/api/products').then(r => r.json())
      setData(Array.isArray(res) ? res : res.data || [])
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageGuard permission="products:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Danh Mục Thuốc</h1>
        <p className="text-zinc-500 text-sm">Quản lý sản phẩm, thuốc, TPCN, trang thiết bị y tế</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng sản phẩm</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đang kinh doanh</div>
          <div className="text-2xl font-bold text-green-700">{stats.selling}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Sắp hết hạn</div>
          <div className="text-2xl font-bold text-red-700">{stats.expiring}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Cần cập nhật giá</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.needPriceUpdate}</div>
        </div>
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
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Nhà SX</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={manufacturerFilter} onChange={e => { setManufacturerFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {getByCategory('product_status').map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <Can permission="products:write">
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={handleOpenModal}>+ Thêm sản phẩm</button>
          </Can>
          <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100">Import</button>
          <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100">Xuất</button>
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
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá bán</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tồn kho</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900">{item.code}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-zinc-600">{item.activeIngredient}</td>
                <td className="px-4 py-3 text-zinc-600">{loading ? '...' : getLabel('product_category', item.category)}</td>
                <td className="px-4 py-3 text-zinc-600">{item.manufacturer}</td>
                <td className="px-4 py-3 text-zinc-600">{item.unit}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.sellingPrice)}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{item.stock}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${getColor('product_status', item.status) || 'bg-zinc-100 text-zinc-800'}`}>
                    {loading ? '...' : getLabel('product_status', item.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
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
              <tr><td colSpan={10} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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
              <h2 className="font-semibold text-sm text-zinc-900">{editingItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mã SP</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Tự động" value={formCode} onChange={e => setFormCode(e.target.value)} />
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Giá bán</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" placeholder="0" value={formSalePrice} onChange={e => setFormSalePrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Tồn kho</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" placeholder="0" value={formMinStock} onChange={e => setFormMinStock(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                  {getByCategory('product_status').map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
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
