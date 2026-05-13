'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'

interface Product {
  id: number
  code: string
  name: string
  unit: string
  category: string
  purchasePrice: number
  salePrice: number
}

interface StockBatch {
  id: number
  productId: number
  productCode: string
  productName: string
  batchNumber: string
  expiryDate: string
  warehouse: string
  quantity: number
  unit: string
  purchasePrice: number
  salePrice: number
  status: string
  product?: Product
}

const statusLabels: Record<string, string> = {
  'in-stock': 'Còn hàng',
  'low-stock': 'Sắp hết',
  expiring: 'Sắp hết hạn',
  expired: 'Hết hạn',
  'out-of-stock': 'Hết hàng',
}

const statusColors: Record<string, string> = {
  'in-stock': 'bg-green-100 text-green-800',
  'low-stock': 'bg-yellow-100 text-yellow-800',
  expiring: 'bg-orange-100 text-orange-800',
  expired: 'bg-red-100 text-red-800',
  'out-of-stock': 'bg-zinc-100 text-zinc-600',
}

const warehouseOptions = [
  { value: 'main', label: 'Kho chính' },
  { value: 'cold', label: 'Kho lạnh' },
  { value: 'quarantine', label: 'Kho cách ly' },
  { value: 'return', label: 'Kho hàng trả' },
]

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function InventoryClient() {
  const [data, setData] = useState<StockBatch[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [warehouseFilter, setWarehouseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, expiring: 0, lowStock: 0, totalValue: 0 })
  const limit = 10

  const [showInboundModal, setShowInboundModal] = useState(false)
  const [showOutboundModal, setShowOutboundModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingBatch, setEditingBatch] = useState<StockBatch | null>(null)
  const [saving, setSaving] = useState(false)

  const [inProductId, setInProductId] = useState('')
  const [inBatchNumber, setInBatchNumber] = useState('')
  const [inExpiryDate, setInExpiryDate] = useState('')
  const [inWarehouse, setInWarehouse] = useState('main')
  const [inQuantity, setInQuantity] = useState('')
  const [inUnit, setInUnit] = useState('')
  const [inPurchasePrice, setInPurchasePrice] = useState('')
  const [inSalePrice, setInSalePrice] = useState('')

  const [outProductId, setOutProductId] = useState('')
  const [outBatchNumber, setOutBatchNumber] = useState('')
  const [outWarehouse, setOutWarehouse] = useState('main')
  const [outQuantity, setOutQuantity] = useState('')
  const [outNote, setOutNote] = useState('')

  const [transferProductId, setTransferProductId] = useState('')
  const [transferBatchNumber, setTransferBatchNumber] = useState('')
  const [transferFromWarehouse, setTransferFromWarehouse] = useState('main')
  const [transferToWarehouse, setTransferToWarehouse] = useState('cold')
  const [transferQuantity, setTransferQuantity] = useState('')
  const [transferNote, setTransferNote] = useState('')

  const [adjProductId, setAdjProductId] = useState('')
  const [adjBatchNumber, setAdjBatchNumber] = useState('')
  const [adjWarehouse, setAdjWarehouse] = useState('main')
  const [adjNewQuantity, setAdjNewQuantity] = useState('')
  const [adjNote, setAdjNote] = useState('')

  const [editBatchNumber, setEditBatchNumber] = useState('')
  const [editExpiryDate, setEditExpiryDate] = useState('')
  const [editWarehouse, setEditWarehouse] = useState('main')
  const [editQuantity, setEditQuantity] = useState('')
  const [editUnit, setEditUnit] = useState('')
  const [editPurchasePrice, setEditPurchasePrice] = useState('')
  const [editSalePrice, setEditSalePrice] = useState('')

  function loadData() {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(json => {
        const list: StockBatch[] = Array.isArray(json) ? json : json.data || []
        const mapped = list.map((b: any) => ({
          ...b,
          productCode: b.product?.code || b.productCode,
          productName: b.product?.name || b.productName,
          purchasePrice: b.purchasePrice,
          salePrice: b.salePrice,
        }))
        setData(mapped)
        setStats({
          total: mapped.length,
          expiring: mapped.filter(b => b.status === 'expiring' || b.status === 'expired').length,
          lowStock: mapped.filter(b => b.status === 'low-stock' || b.status === 'out-of-stock').length,
          totalValue: mapped.reduce((s, b) => s + (b.purchasePrice || 0) * b.quantity, 0),
        })
      })
   }

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(json => {
        const list: StockBatch[] = Array.isArray(json) ? json : json.data || []
        const mapped = list.map((b: any) => ({
          ...b,
          productCode: b.product?.code || b.productCode,
          productName: b.product?.name || b.productName,
          purchasePrice: b.purchasePrice,
          salePrice: b.salePrice,
        }))
        setData(mapped)
        setStats({
          total: mapped.length,
          expiring: mapped.filter(b => b.status === 'expiring' || b.status === 'expired').length,
          lowStock: mapped.filter(b => b.status === 'low-stock' || b.status === 'out-of-stock').length,
          totalValue: mapped.reduce((s, b) => s + (b.purchasePrice || 0) * b.quantity, 0),
        })
      })
    fetch('/api/products?limit=1000')
      .then(r => r.json())
      .then(json => {
        const list: Product[] = Array.isArray(json) ? json : json.data || []
        setProducts(list)
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.productName.toLowerCase().includes(q) && !item.productCode.toLowerCase().includes(q) && !item.batchNumber.toLowerCase().includes(q)) return false
    if (warehouseFilter && item.warehouse !== warehouseFilter) return false
    if (statusFilter && item.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  function getBatchesForProduct(productId: string) {
    return data.filter(b => b.productId === parseInt(productId))
  }

  function getSelectedProduct(productId: string) {
    return products.find(p => p.id === parseInt(productId))
  }

  function handleDelete(id: number) {
    if (!confirm('Xóa lô hàng này?')) return
    fetch(`/api/inventory/${id}`, { method: 'DELETE' }).then(() => {
      loadData()
    })
  }

  function openEditModal(batch: StockBatch) {
    setEditingBatch(batch)
    setEditBatchNumber(batch.batchNumber)
    setEditExpiryDate(batch.expiryDate.split('T')[0])
    setEditWarehouse(batch.warehouse)
    setEditQuantity(String(batch.quantity))
    setEditUnit(batch.unit)
    setEditPurchasePrice(String(batch.purchasePrice))
    setEditSalePrice(String(batch.salePrice))
    setShowEditModal(true)
  }

  async function handleInboundSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: inProductId,
          batchNumber: inBatchNumber,
          expiryDate: inExpiryDate,
          warehouse: inWarehouse,
          quantity: inQuantity,
          unit: inUnit,
          purchasePrice: inPurchasePrice,
          salePrice: inSalePrice,
        }),
      })
      setShowInboundModal(false)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  async function handleOutboundSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'out',
          productId: outProductId,
          batchNumber: outBatchNumber,
          quantity: outQuantity,
          warehouse: outWarehouse,
          note: outNote,
        }),
      })
      setShowOutboundModal(false)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  async function handleTransferSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'transfer',
          productId: transferProductId,
          batchNumber: transferBatchNumber,
          quantity: transferQuantity,
          fromWarehouse: transferFromWarehouse,
          toWarehouse: transferToWarehouse,
          note: transferNote,
        }),
      })
      setShowTransferModal(false)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  async function handleAdjustmentSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const batch = data.find(
        b => b.productId === parseInt(adjProductId) &&
             b.batchNumber === adjBatchNumber &&
             b.warehouse === adjWarehouse
      )
      if (batch) {
        await fetch(`/api/inventory/${batch.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: parseInt(adjNewQuantity),
          }),
        })
      }
      await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'adjustment',
          productId: adjProductId,
          batchNumber: adjBatchNumber,
          warehouse: adjWarehouse,
          quantity: adjNewQuantity,
          newQuantity: parseInt(adjNewQuantity),
          note: adjNote,
        }),
      })
      setShowAdjustmentModal(false)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingBatch) return
    setSaving(true)
    try {
      await fetch(`/api/inventory/${editingBatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchNumber: editBatchNumber,
          expiryDate: editExpiryDate,
          warehouse: editWarehouse,
          quantity: parseInt(editQuantity),
          unit: editUnit,
          purchasePrice: parseFloat(editPurchasePrice),
          salePrice: parseFloat(editSalePrice),
        }),
      })
      setShowEditModal(false)
      loadData()
    } finally {
      setSaving(false)
    }
  }

  function openInboundModal() {
    setInProductId('')
    setInBatchNumber('')
    setInExpiryDate('')
    setInWarehouse('main')
    setInQuantity('')
    setInUnit('')
    setInPurchasePrice('')
    setInSalePrice('')
    setShowInboundModal(true)
  }

  function openOutboundModal() {
    setOutProductId('')
    setOutBatchNumber('')
    setOutWarehouse('main')
    setOutQuantity('')
    setOutNote('')
    setShowOutboundModal(true)
  }

  function openTransferModal() {
    setTransferProductId('')
    setTransferBatchNumber('')
    setTransferFromWarehouse('main')
    setTransferToWarehouse('cold')
    setTransferQuantity('')
    setTransferNote('')
    setShowTransferModal(true)
  }

  function openAdjustmentModal() {
    setAdjProductId('')
    setAdjBatchNumber('')
    setAdjWarehouse('main')
    setAdjNewQuantity('')
    setAdjNote('')
    setShowAdjustmentModal(true)
  }

  const expiringCount = data.filter(b => b.status === 'expiring').length
  const expiredCount = data.filter(b => b.status === 'expired').length
  const qualityCheckCount = data.filter(b => b.status === 'expiring').length

  return (
    <PageGuard permission="inventory:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Quản Lý Kho</h1>
        <p className="text-zinc-500 text-sm">Quản lý tồn kho, lô thuốc, hạn sử dụng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng thuốc</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Sắp hết hạn</div>
          <div className="text-2xl font-bold text-red-700">{stats.expiring}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tồn kho thấp</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.lowStock}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Giá trị tồn kho</div>
          <div className="text-2xl font-bold text-zinc-900">{formatVND(stats.totalValue)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-700">Sắp hết hạn</span>
          <span className="font-bold text-sm text-yellow-800">{expiringCount}</span>
        </div>
        <div className="bg-white border border-zinc-300 p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-700">Đã hết hạn</span>
          <span className="font-bold text-sm text-red-800">{expiredCount}</span>
        </div>
        <div className="bg-white border border-zinc-300 p-3 flex items-center justify-between">
          <span className="text-sm text-zinc-700">Cần kiểm tra</span>
          <span className="font-bold text-sm text-blue-800">{qualityCheckCount}</span>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã SP, tên, số lô..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Kho</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={warehouseFilter} onChange={e => { setWarehouseFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {warehouseOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Can permission="inventory:write">
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={openInboundModal}>Nhập Kho</button>
          </Can>
          <Can permission="inventory:write">
            <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={openOutboundModal}>Xuất Kho</button>
          </Can>
          <Can permission="inventory:write">
            <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={openTransferModal}>Chuyển Kho</button>
          </Can>
          <Can permission="inventory:write">
            <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={openAdjustmentModal}>Kiểm Kê</button>
          </Can>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã SP</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Tên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Số Lô</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Hạn SD</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Kho</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tồn</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">ĐVT</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá Nhập</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Giá Bán</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">TT</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900">{item.productCode}</td>
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.productName}</td>
                <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{item.batchNumber}</td>
                <td className="px-4 py-3 text-zinc-600 text-xs">{new Date(item.expiryDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-600">{warehouseOptions.find(w => w.value === item.warehouse)?.label || item.warehouse}</td>
                <td className="px-4 py-3 text-zinc-900 text-right font-medium">{item.quantity}</td>
                <td className="px-4 py-3 text-zinc-600">{item.unit}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.purchasePrice)}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.salePrice)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${statusColors[item.status] || 'bg-zinc-100 text-zinc-800'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <Can permission="inventory:write">
                      <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => openEditModal(item)}>Sửa</button>
                    </Can>
                    <Can permission="inventory:delete">
                      <button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>Xóa</button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-8 text-center text-zinc-400">Không có dữ liệu</td></tr>
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

      {showInboundModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowInboundModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4 max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-semibold text-sm text-zinc-900">Nhập Kho</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowInboundModal(false)}>×</button>
            </div>
            <form onSubmit={handleInboundSubmit}>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Sản phẩm</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={inProductId} onChange={e => {
                    setInProductId(e.target.value)
                    const p = getSelectedProduct(e.target.value)
                    if (p) {
                      setInUnit(p.unit)
                      setInPurchasePrice(String(p.purchasePrice))
                      setInSalePrice(String(p.salePrice))
                    }
                  }} required>
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Số lô</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập số lô" value={inBatchNumber} onChange={e => setInBatchNumber(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Hạn sử dụng</label>
                    <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={inExpiryDate} onChange={e => setInExpiryDate(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Kho</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={inWarehouse} onChange={e => setInWarehouse(e.target.value)}>
                      {warehouseOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Số lượng</label>
                    <input type="number" min="1" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={inQuantity} onChange={e => setInQuantity(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Đơn vị</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Viên, Hộp..." value={inUnit} onChange={e => setInUnit(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Giá nhập</label>
                    <input type="number" step="100" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={inPurchasePrice} onChange={e => setInPurchasePrice(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Giá bán</label>
                  <input type="number" step="100" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={inSalePrice} onChange={e => setInSalePrice(e.target.value)} />
                </div>
              </div>
              <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2 sticky bottom-0 bg-white">
                <button type="button" className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowInboundModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOutboundModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowOutboundModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Xuất Kho</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowOutboundModal(false)}>×</button>
            </div>
            <form onSubmit={handleOutboundSubmit}>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Sản phẩm</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={outProductId} onChange={e => {
                    setOutProductId(e.target.value)
                    setOutBatchNumber('')
                  }} required>
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Số lô</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={outBatchNumber} onChange={e => setOutBatchNumber(e.target.value)} required>
                      <option value="">-- Chọn lô --</option>
                      {getBatchesForProduct(outProductId).map(b => (
                        <option key={b.id} value={b.batchNumber}>{b.batchNumber} ({b.warehouse} - {b.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Kho</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={outWarehouse} onChange={e => setOutWarehouse(e.target.value)}>
                      {warehouseOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Số lượng</label>
                  <input type="number" min="1" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={outQuantity} onChange={e => setOutQuantity(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ghi chú / Đích đến</label>
                  <textarea className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập ghi chú..." rows={3} value={outNote} onChange={e => setOutNote(e.target.value)} />
                </div>
              </div>
              <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowOutboundModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransferModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowTransferModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Chuyển Kho</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowTransferModal(false)}>×</button>
            </div>
            <form onSubmit={handleTransferSubmit}>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Sản phẩm</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={transferProductId} onChange={e => {
                    setTransferProductId(e.target.value)
                    setTransferBatchNumber('')
                  }} required>
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Số lô</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={transferBatchNumber} onChange={e => setTransferBatchNumber(e.target.value)} required>
                    <option value="">-- Chọn lô --</option>
                    {getBatchesForProduct(transferProductId).map(b => (
                      <option key={b.id} value={b.batchNumber}>{b.batchNumber} ({b.warehouse} - {b.quantity})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Từ kho</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={transferFromWarehouse} onChange={e => setTransferFromWarehouse(e.target.value)}>
                      {warehouseOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Đến kho</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={transferToWarehouse} onChange={e => setTransferToWarehouse(e.target.value)}>
                      {warehouseOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Số lượng</label>
                  <input type="number" min="1" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={transferQuantity} onChange={e => setTransferQuantity(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ghi chú</label>
                  <textarea className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập ghi chú..." rows={2} value={transferNote} onChange={e => setTransferNote(e.target.value)} />
                </div>
              </div>
              <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowTransferModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdjustmentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAdjustmentModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Kiểm Kê</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowAdjustmentModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdjustmentSubmit}>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Sản phẩm</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={adjProductId} onChange={e => {
                    setAdjProductId(e.target.value)
                    setAdjBatchNumber('')
                  }} required>
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Số lô</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={adjBatchNumber} onChange={e => setAdjBatchNumber(e.target.value)} required>
                      <option value="">-- Chọn lô --</option>
                      {getBatchesForProduct(adjProductId).map(b => (
                        <option key={b.id} value={b.batchNumber}>{b.batchNumber} ({b.warehouse} - {b.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Kho</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={adjWarehouse} onChange={e => setAdjWarehouse(e.target.value)}>
                      {warehouseOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Số lượng thực tế</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={adjNewQuantity} onChange={e => setAdjNewQuantity(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ghi chú</label>
                  <textarea className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Lý do kiểm kê..." rows={2} value={adjNote} onChange={e => setAdjNote(e.target.value)} />
                </div>
              </div>
              <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowAdjustmentModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingBatch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Sửa Lô Hàng</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Số lô</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập số lô" value={editBatchNumber} onChange={e => setEditBatchNumber(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Hạn sử dụng</label>
                    <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editExpiryDate} onChange={e => setEditExpiryDate(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Kho</label>
                    <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editWarehouse} onChange={e => setEditWarehouse(e.target.value)}>
                      {warehouseOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Số lượng</label>
                    <input type="number" min="0" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Đơn vị</label>
                    <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="ĐVT" value={editUnit} onChange={e => setEditUnit(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Giá nhập</label>
                    <input type="number" step="100" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={editPurchasePrice} onChange={e => setEditPurchasePrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Giá bán</label>
                    <input type="number" step="100" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="0" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
                <button type="button" className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageGuard>
  )
}
