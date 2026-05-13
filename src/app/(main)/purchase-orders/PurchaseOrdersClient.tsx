'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'

interface PurchaseOrder {
  id: number
  code: string
  supplierName: string
  createdAt: string
  deliveryDate: string
  totalAmount: number
  priority: string
  status: string
  notes: string | null
  createdBy: { id: number; name: string }
}

interface Product {
  id: number
  name: string
  purchasePrice: number
  unit: string
}

interface LineItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  processing: 'Đang xử lý',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const priorityLabels: Record<string, string> = {
  low: 'Thấp',
  normal: 'Bình thường',
  high: 'Cao',
  urgent: 'Khẩn cấp',
}

const priorityColors: Record<string, string> = {
  low: 'bg-zinc-100 text-zinc-600',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function PurchaseOrdersClient() {
  const [data, setData] = useState<PurchaseOrder[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, monthlyValue: 0 })
  const limit = 10

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [form, setForm] = useState({
    supplierName: '',
    orderDate: todayStr(),
    deliveryDate: '',
    priority: 'normal',
    notes: '',
    items: [] as LineItem[],
  })

  function fetchOrders() {
    fetch('/api/purchase-orders')
      .then(r => r.json())
      .then(res => {
        const list: PurchaseOrder[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        setStats({
          total: list.length,
          pending: list.filter(o => o.status === 'pending').length,
          approved: list.filter(o => o.status === 'approved').length,
          monthlyValue: list.filter(o => new Date(o.createdAt) >= monthStart && o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0),
        })
      })
  }

  useEffect(() => {
    fetchOrders()
    fetch('/api/products')
      .then(r => r.json())
      .then(res => {
        const list: Product[] = Array.isArray(res) ? res : res.data || []
        setProducts(list)
      })
  }, [])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.code.toLowerCase().includes(q) && !item.supplierName.toLowerCase().includes(q)) return false
    if (statusFilter && item.status !== statusFilter) return false
    if (supplierFilter && !item.supplierName.toLowerCase().includes(supplierFilter.toLowerCase())) return false
    if (priorityFilter && item.priority !== priorityFilter) return false
    if (fromDate && new Date(item.createdAt) < new Date(fromDate)) return false
    if (toDate && new Date(item.createdAt) > new Date(toDate + 'T23:59:59')) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  const suppliers = [...new Set(data.map(o => o.supplierName).filter(Boolean))]

  function handleProductSelect(index: number, productId: number) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    const items = [...form.items]
    items[index] = { ...items[index], productId: product.id, productName: product.name, unitPrice: product.purchasePrice }
    setForm(f => ({ ...f, items }))
  }

  function addLineItem() {
    setForm(f => ({ ...f, items: [...f.items, { productId: 0, productName: '', quantity: 1, unitPrice: 0 }] }))
  }

  function removeLineItem(index: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== index) }))
  }

  function updateLineItem(index: number, field: keyof LineItem, value: number | string) {
    const items = [...form.items]
    ;(items[index] as any)[field] = value
    setForm(f => ({ ...f, items }))
  }

  const totalAmount = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  function handleSubmit() {
    const body = {
      supplierName: form.supplierName,
      orderDate: form.orderDate,
      deliveryDate: form.deliveryDate || null,
      priority: form.priority,
      notes: form.notes || null,
      items: form.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    }
    fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => {
      if (!r.ok) throw new Error('Failed')
      setShowCreateModal(false)
      setForm({ supplierName: '', orderDate: todayStr(), deliveryDate: '', priority: 'normal', notes: '', items: [] })
      fetchOrders()
    })
  }

  function handleEditOrder(item: PurchaseOrder) {
    setEditingOrder(item)
    setEditStatus(item.status)
    setEditPriority(item.priority)
    setEditNotes(item.notes || '')
    setShowEditModal(true)
  }

  async function handleUpdateOrder() {
    if (!editingOrder) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/purchase-orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, priority: editPriority, notes: editNotes }),
      })
      if (!res.ok) throw new Error('Cập nhật thất bại')
      setShowEditModal(false)
      setEditingOrder(null)
      fetchOrders()
    } catch {
      alert('Cập nhật đơn mua thất bại')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDeleteOrder(item: PurchaseOrder) {
    if (!confirm(`Xóa đơn mua ${item.code}?`)) return
    try {
      await fetch(`/api/purchase-orders/${item.id}`, { method: 'DELETE' })
    } catch { }
    fetchOrders()
  }

  return (
    <PageGuard permission="purchase-orders:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Đơn Hàng Mua</h1>
        <p className="text-zinc-500 text-sm">Quản lý đơn nhập hàng từ nhà cung cấp</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Tổng đơn mua</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.total}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Chờ duyệt</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đã duyệt</div>
          <div className="text-2xl font-bold text-blue-700">{stats.approved}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Giá trị mua tháng</div>
          <div className="text-2xl font-bold text-zinc-900">{formatVND(stats.monthlyValue)}</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã đơn, nhà cung cấp..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Nhà cung cấp</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={supplierFilter} onChange={e => { setSupplierFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Mức độ ưu tiên</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Từ ngày</label>
            <input type="date" className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Đến ngày</label>
            <input type="date" className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <Can permission="purchase-orders:write">
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={() => setShowCreateModal(true)}>+ Tạo đơn mua</button>
          </Can>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã đơn mua</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Nhà cung cấp</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày tạo</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày giao</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tổng tiền</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ưu tiên</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Người tạo</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.code}</td>
                <td className="px-4 py-3 text-zinc-600">{item.supplierName}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString('vi-VN') : '-'}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${priorityColors[item.priority] || 'bg-zinc-100 text-zinc-800'}`}>
                    {priorityLabels[item.priority] || item.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${statusColors[item.status] || 'bg-zinc-100 text-zinc-800'}`}>
                    {statusLabels[item.status] || item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{item.createdBy?.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                    <Can permission="purchase-orders:write">
                      <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEditOrder(item)}>Sửa</button>
                    </Can>
                    <Can permission="purchase-orders:delete">
                      <button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDeleteOrder(item)}>Xóa</button>
                    </Can>
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Tạo đơn mua mới</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Nhà cung cấp</label>
                <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Nhập tên nhà cung cấp" value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày đặt hàng</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Ngày giao dự kiến</label>
                  <input type="date" className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Mức độ ưu tiên</label>
                  <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div />
              </div>

              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Ghi chú</label>
                <textarea className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" rows={3} placeholder="Ghi chú..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>

              <div className="border-t border-zinc-300 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-700">Danh sách sản phẩm</label>
                  <button className="text-xs px-3 py-1 border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={addLineItem}>+ Thêm sản phẩm</button>
                </div>

                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end mb-2 p-2 bg-zinc-50">
                    <div className="col-span-4">
                      <label className="text-xs text-zinc-500 mb-1 block">Sản phẩm</label>
                      <select className="w-full px-2 py-2 border border-zinc-300 text-sm focus:outline-none" value={item.productId || ''} onChange={e => handleProductSelect(index, Number(e.target.value))}>
                        <option value="">-- Chọn --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-zinc-500 mb-1 block">Số lượng</label>
                      <input type="number" min={1} className="w-full px-2 py-2 border border-zinc-300 text-sm focus:outline-none" value={item.quantity} onChange={e => updateLineItem(index, 'quantity', Number(e.target.value))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-zinc-500 mb-1 block">Đơn giá</label>
                      <input type="number" min={0} className="w-full px-2 py-2 border border-zinc-300 text-sm focus:outline-none" value={item.unitPrice} onChange={e => updateLineItem(index, 'unitPrice', Number(e.target.value))} />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs text-zinc-500 mb-1 block">Thành tiền</label>
                      <div className="px-2 py-2 text-sm text-zinc-900 font-medium">{formatVND(item.quantity * item.unitPrice)}</div>
                    </div>
                    <div className="col-span-1">
                      <button className="px-2 py-2 text-sm text-red-600 hover:text-red-800" onClick={() => removeLineItem(index)}>×</button>
                    </div>
                  </div>
                ))}

                {form.items.length === 0 && (
                  <p className="text-xs text-zinc-400 py-2">Chưa có sản phẩm nào. Nhấn &ldquo;Thêm sản phẩm&rdquo; để bắt đầu.</p>
                )}
              </div>

              <div className="flex justify-end border-t border-zinc-300 pt-3">
                <div className="text-sm">
                  <span className="text-zinc-500">Tổng cộng: </span>
                  <span className="font-bold text-zinc-900">{formatVND(totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
              <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowCreateModal(false)}>Hủy</button>
              <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" disabled={!form.supplierName || form.items.length === 0} onClick={handleSubmit}>Tạo đơn mua</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Sửa đơn mua {editingOrder.code}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Mức độ ưu tiên</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                  {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Ghi chú</label>
                <textarea className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" rows={3} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
              </div>
            </div>
            <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
              <button className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100" onClick={() => setShowEditModal(false)}>Hủy</button>
              <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50" onClick={handleUpdateOrder} disabled={updating}>{updating ? 'Đang lưu...' : 'Lưu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageGuard>
  )
}
