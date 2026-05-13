'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'
import { useLookups } from '@/hooks/useLookups'

interface PriceListItem {
  id: number
  productId: number
  productCode: string
  productName: string
  category: string
  type: string
  basePrice: number
  sellingPrice: number
  effectiveDate: string
  expiryDate: string
  status: string
}

interface ProductOption {
  id: number
  code: string
  name: string
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function PricingClient() {
  const { getLabel, getByCategory, getColor } = useLookups()
  const [data, setData] = useState<PriceListItem[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const limit = 10

  const [formProductId, setFormProductId] = useState('')
  const [formType, setFormType] = useState('retail')
  const [formPrice, setFormPrice] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [editingItem, setEditingItem] = useState<PriceListItem | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/price-lists').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([priceRes, productRes]) => {
      const list: PriceListItem[] = Array.isArray(priceRes) ? priceRes : priceRes.data || []
      setData(list)
      const products: ProductOption[] = Array.isArray(productRes) ? productRes : productRes.data || []
      setProductOptions(products)
    })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.productName.toLowerCase().includes(q) && !item.productCode.toLowerCase().includes(q)) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  function handleOpenModal() {
    setEditingItem(null)
    setFormProductId('')
    setFormType('retail')
    setFormPrice('')
    setFormStartDate('')
    setFormEndDate('')
    setShowModal(true)
  }

  function handleEdit(item: PriceListItem) {
    setEditingItem(item)
    setFormProductId(String(item.productId))
    setFormType(item.type)
    setFormPrice(String(item.basePrice || item.sellingPrice))
    setFormStartDate(item.effectiveDate ? item.effectiveDate.slice(0, 10) : '')
    setFormEndDate(item.expiryDate ? item.expiryDate.slice(0, 10) : '')
    setShowModal(true)
  }

  async function handleDelete(item: PriceListItem) {
    if (!confirm(`Xóa bảng giá của ${item.productName}?`)) return
    try {
      await fetch(`/api/price-lists/${item.id}`, { method: 'DELETE' })
    } catch { }
    const [priceRes] = await Promise.all([
      fetch('/api/price-lists').then(r => r.json()),
    ])
    setData(Array.isArray(priceRes) ? priceRes : priceRes.data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingItem ? `/api/price-lists/${editingItem.id}` : '/api/price-lists'
      await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: parseInt(formProductId) || 0,
          type: formType,
          price: parseFloat(formPrice) || 0,
          startDate: formStartDate,
          endDate: formEndDate,
        }),
      })
      setShowModal(false)
      setEditingItem(null)
      const [priceRes] = await Promise.all([
        fetch('/api/price-lists').then(r => r.json()),
      ])
      setData(Array.isArray(priceRes) ? priceRes : priceRes.data || [])
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageGuard permission="pricing:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Quản Lý Giá</h1>
        <p className="text-zinc-500 text-sm">Thiết lập và quản lý bảng giá bán thuốc, TPCN, thiết bị y tế</p>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã SP, tên..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Loại giá</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {getByCategory('price_type').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {getByCategory('price_status').map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <Can permission="pricing:write"><button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={handleOpenModal}>+ Thêm bảng giá</button></Can>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã SP</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên sản phẩm</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Loại giá</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá cơ sở</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá bán</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Hiệu lực từ</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Đến ngày</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900">{item.productCode}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-zinc-600">{getLabel('price_type', item.type)}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.basePrice)}</td>
                <td className="px-4 py-3 text-zinc-900 text-right font-medium">{formatVND(item.sellingPrice)}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.effectiveDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${getColor('price_status', item.status) ?? 'bg-zinc-100 text-zinc-600'}`}>
                    {getLabel('price_status', item.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <Can permission="pricing:write"><button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEdit(item)}>Sửa</button></Can>
                    <Can permission="pricing:delete"><button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDelete(item)}>Xóa</button></Can>
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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
              <h2 className="font-semibold text-sm text-zinc-900">{editingItem ? 'Sửa bảng giá' : 'Thêm bảng giá'}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Sản phẩm</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formProductId} onChange={e => setFormProductId(e.target.value)}>
                  <option value="">Chọn sản phẩm</option>
                  {productOptions.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Loại giá</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formType} onChange={e => setFormType(e.target.value)}>
                    {getByCategory('price_type').map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Giá bán</label>
                  <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" type="number" placeholder="0" value={formPrice} onChange={e => setFormPrice(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Hiệu lực từ</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Đến ngày</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
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
