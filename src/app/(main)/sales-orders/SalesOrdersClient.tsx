'use client'

import { useEffect, useState } from 'react'
import { Can } from '@/components/Can'
import { PageGuard } from '@/components/PageGuard'
import { useLookups } from '@/hooks/useLookups'

interface SalesOrderItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  product: { name: string; code: string }
}

interface SalesOrder {
  id: number
  code: string
  orderDate: string
  totalAmount: number
  status: string
  notes: string | null
  createdAt: string
  customer: { id: number; name: string; code: string }
  salesPerson?: { id: number; name: string }
  items: SalesOrderItem[]
}

interface CustomerOption {
  id: number
  code: string
  name: string
}

interface ProductOption {
  id: number
  code: string
  name: string
  salePrice: number
}

interface LineItem {
  productId: number
  quantity: number
  unitPrice: number
}

interface NewOrderForm {
  customerId: number
  orderDate: string
  notes: string
  items: LineItem[]
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function SalesOrdersClient() {
  const [data, setData] = useState<SalesOrder[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [activeNav, setActiveNav] = useState('')
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ today: 0, pending: 0, processing: 0, revenue: 0 })
  const limit = 10

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [newOrder, setNewOrder] = useState<NewOrderForm>({
    customerId: 0,
    orderDate: todayStr(),
    notes: '',
    items: [],
  })
  const [creating, setCreating] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const { getLabel, getColor, getByCategory, loading } = useLookups()

  const navTabs = [
    { key: '', label: 'Tất cả' },
    ...getByCategory('order_status')
      .filter(l => l.isActive)
      .map(l => ({ key: l.value, label: l.label })),
  ]

  const fetchOrders = () => {
    fetch('/api/sales-orders')
      .then(r => r.json())
      .then(res => {
        const list: SalesOrder[] = Array.isArray(res) ? res : res.data || []
        setData(list)
        const today = new Date().toDateString()
        setStats({
          today: list.filter(o => new Date(o.orderDate).toDateString() === today).length,
          pending: list.filter(o => o.status === 'pending').length,
          processing: list.filter(o => o.status === 'processing').length,
          revenue: list.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0),
        })
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!showCreateModal) return
    fetch('/api/customers')
      .then(r => r.json())
      .then(res => {
        const list: CustomerOption[] = Array.isArray(res) ? res : res.data || []
        setCustomers(list)
      })
    fetch('/api/products')
      .then(r => r.json())
      .then(res => {
        const list: ProductOption[] = Array.isArray(res) ? res : res.data || []
        setProducts(list)
      })
  }, [showCreateModal])

  const filtered = data.filter(item => {
    const q = search.toLowerCase()
    if (q && !item.code.toLowerCase().includes(q) && !item.customer?.name.toLowerCase().includes(q)) return false
    if (activeNav && item.status !== activeNav) return false
    if (statusFilter && item.status !== statusFilter) return false
    if (fromDate && new Date(item.orderDate) < new Date(fromDate)) return false
    if (toDate && new Date(item.orderDate) > new Date(toDate + 'T23:59:59')) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / limit)
  const paged = filtered.slice((page - 1) * limit, page * limit)

  function handleProductSelect(index: number, productId: number) {
    const product = products.find(p => p.id === productId)
    const items = [...newOrder.items]
    items[index] = { ...items[index], productId, unitPrice: product?.salePrice ?? 0 }
    setNewOrder({ ...newOrder, items })
  }

  function handleItemChange(index: number, field: keyof LineItem, value: number) {
    const items = [...newOrder.items]
    items[index] = { ...items[index], [field]: value }
    setNewOrder({ ...newOrder, items })
  }

  function addLineItem() {
    setNewOrder({ ...newOrder, items: [...newOrder.items, { productId: 0, quantity: 1, unitPrice: 0 }] })
  }

  function removeLineItem(index: number) {
    const items = newOrder.items.filter((_, i) => i !== index)
    setNewOrder({ ...newOrder, items })
  }

  const totalAmount = newOrder.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)

  async function handleCreate() {
    if (!newOrder.customerId) return
    if (newOrder.items.length === 0) return
    setCreating(true)
    try {
      const res = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: 'auto',
          customerId: newOrder.customerId,
          orderDate: newOrder.orderDate,
          notes: newOrder.notes,
          items: newOrder.items,
        }),
      })
      if (!res.ok) throw new Error('Tạo đơn hàng thất bại')
      setShowCreateModal(false)
      setNewOrder({ customerId: 0, orderDate: todayStr(), notes: '', items: [] })
      fetchOrders()
    } catch {
      alert('Tạo đơn hàng thất bại')
    } finally {
      setCreating(false)
    }
  }

  function handleEditOrder(item: SalesOrder) {
    setEditingOrder(item)
    setEditStatus(item.status)
    setEditNotes(item.notes || '')
    setShowEditModal(true)
  }

  async function handleUpdateOrder() {
    if (!editingOrder) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/sales-orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, notes: editNotes }),
      })
      if (!res.ok) throw new Error('Cập nhật thất bại')
      setShowEditModal(false)
      setEditingOrder(null)
      fetchOrders()
    } catch {
      alert('Cập nhật đơn hàng thất bại')
    } finally {
      setUpdating(false)
    }
  }

  async function handleDeleteOrder(item: SalesOrder) {
    if (!confirm(`Xóa đơn hàng ${item.code}?`)) return
    try {
      await fetch(`/api/sales-orders/${item.id}`, { method: 'DELETE' })
    } catch { }
    fetchOrders()
  }

  return (
    <PageGuard permission="sales-orders:read">
      <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Đơn Hàng Bán</h1>
        <p className="text-zinc-500 text-sm">Quản lý đơn hàng bán thuốc, TPCN, thiết bị y tế</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đơn hàng hôm nay</div>
          <div className="text-2xl font-bold text-zinc-900">{stats.today}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Chờ duyệt</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Đang xử lý</div>
          <div className="text-2xl font-bold text-indigo-700">{stats.processing}</div>
        </div>
        <div className="bg-white border border-zinc-300 p-4">
          <div className="text-zinc-500 text-xs mb-1">Doanh thu hôm nay</div>
          <div className="text-2xl font-bold text-green-700">{formatVND(stats.revenue)}</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 mb-6">
        <div className="border-b border-zinc-300">
          <nav className="flex overflow-x-auto">
            {navTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveNav(tab.key); setPage(1) }}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${activeNav === tab.key ? 'border-zinc-900 text-zinc-900 font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-zinc-500 mb-1 block">Tìm kiếm</label>
            <input className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" placeholder="Mã đơn, khách hàng..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
            <select className="px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">Tất cả</option>
              {getByCategory('order_status').filter(l => l.isActive).map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
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
          <Can permission="sales-orders:write">
            <button className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800" onClick={() => setShowCreateModal(true)}>+ Tạo đơn hàng</button>
          </Can>
        </div>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mã đơn</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Khách hàng</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Ngày</th>
              <th className="text-right px-4 py-3 text-zinc-700 font-medium">Tổng tiền</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Trạng thái</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Nhân viên</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(item => (
              <tr key={item.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-900 font-medium">{item.code}</td>
                <td className="px-4 py-3 text-zinc-600">{item.customer?.name}</td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(item.orderDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-zinc-900 text-right">{formatVND(item.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-1.5 py-0.5 ${getColor('order_status', item.status) || 'bg-zinc-100 text-zinc-800'}`}>
                    {loading ? '...' : getLabel('order_status', item.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">{item.salesPerson?.name}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100">Xem</button>
                    <Can permission="sales-orders:write">
                      <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => handleEditOrder(item)}>Sửa</button>
                    </Can>
                    <Can permission="sales-orders:delete">
                      <button className="px-2 py-1 text-xs border border-red-300 text-red-700 hover:bg-red-100" onClick={() => handleDeleteOrder(item)}>Xóa</button>
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Tạo đơn hàng mới</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Khách hàng</label>
                <select
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none"
                  value={newOrder.customerId || ''}
                  onChange={e => setNewOrder({ ...newOrder, customerId: Number(e.target.value) })}
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Ngày đặt</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none"
                  value={newOrder.orderDate}
                  onChange={e => setNewOrder({ ...newOrder, orderDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Ghi chú</label>
                <textarea
                  className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none"
                  rows={3}
                  value={newOrder.notes}
                  onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-zinc-500">Danh sách sản phẩm</label>
                  <button
                    className="text-xs px-2 py-1 border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    onClick={addLineItem}
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
                {newOrder.items.length === 0 && (
                  <p className="text-xs text-zinc-400 py-2">Chưa có sản phẩm nào</p>
                )}
                {newOrder.items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end mb-2 border border-zinc-200 p-2">
                    <div className="flex-1 min-w-0">
                      <label className="text-xs text-zinc-500 mb-1 block">Sản phẩm</label>
                      <select
                        className="w-full px-2 py-2 border border-zinc-300 text-sm focus:outline-none"
                        value={item.productId || ''}
                        onChange={e => handleProductSelect(i, Number(e.target.value))}
                      >
                        <option value="">-- Chọn --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-20">
                      <label className="text-xs text-zinc-500 mb-1 block">SL</label>
                      <input
                        type="number"
                        min={1}
                        className="w-full px-2 py-2 border border-zinc-300 text-sm focus:outline-none"
                        value={item.quantity}
                        onChange={e => handleItemChange(i, 'quantity', Number(e.target.value))}
                      />
                    </div>
                    <div className="w-28">
                      <label className="text-xs text-zinc-500 mb-1 block">Đơn giá</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full px-2 py-2 border border-zinc-300 text-sm focus:outline-none"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(i, 'unitPrice', Number(e.target.value))}
                      />
                    </div>
                    <div className="w-28 text-right">
                      <label className="text-xs text-zinc-500 mb-1 block">Thành tiền</label>
                      <div className="py-2 text-sm text-zinc-900 font-medium">
                        {formatVND(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                    <button
                      className="px-2 py-2 text-sm text-red-600 hover:text-red-800"
                      onClick={() => removeLineItem(i)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-zinc-300 pt-3">
                <div className="text-sm">
                  <span className="text-zinc-500">Tổng cộng: </span>
                  <span className="font-bold text-zinc-900">{formatVND(totalAmount)}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-zinc-300 px-4 py-3 flex justify-end gap-2">
              <button
                className="px-4 py-2 border border-zinc-300 text-zinc-700 text-sm hover:bg-zinc-100"
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50"
                disabled={!newOrder.customerId || newOrder.items.length === 0 || creating}
                onClick={handleCreate}
              >
                {creating ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white border border-zinc-300 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="border-b border-zinc-300 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-zinc-900">Sửa đơn hàng {editingOrder.code}</h2>
              <button className="text-zinc-400 hover:text-zinc-900 text-lg" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Trạng thái</label>
                <select className="w-full px-3 py-2 border border-zinc-300 text-sm focus:outline-none" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  {getByCategory('order_status').filter(l => l.isActive).map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
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
