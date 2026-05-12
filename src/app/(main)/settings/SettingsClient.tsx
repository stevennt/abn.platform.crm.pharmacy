'use client'

import { useEffect, useState } from 'react'

interface Setting {
  key: string
  value: string
  description: string
}

export default function SettingsClient() {
  const [data, setData] = useState<Setting[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(res => {
        const list: Setting[] = Array.isArray(res) ? res : res.data || []
        setData(list)
      })
  }, [])

  function handleSave(key: string) {
    fetch(`/api/settings/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: editValue }),
    }).then(() => {
      setData(prev => prev.map(s => s.key === key ? { ...s, value: editValue } : s))
      setEditing(null)
    })
  }

  const defaultSettings: Setting[] = data.length > 0 ? data : [
    { key: 'company_name', value: 'ABN Pharma CRM', description: 'Tên công ty' },
    { key: 'company_address', value: '', description: 'Địa chỉ công ty' },
    { key: 'company_phone', value: '', description: 'Số điện thoại' },
    { key: 'company_email', value: '', description: 'Email' },
    { key: 'company_tax_code', value: '', description: 'Mã số thuế' },
    { key: 'vat_rate', value: '10', description: 'Thuế VAT mặc định (%)' },
    { key: 'currency', value: 'VND', description: 'Đơn vị tiền tệ' },
    { key: 'low_stock_threshold', value: '10', description: 'Ngưỡng tồn kho thấp' },
    { key: 'expiry_warning_days', value: '30', description: 'Cảnh báo hạn dùng (ngày)' },
    { key: 'default_credit_limit', value: '0', description: 'Hạn mức tín dụng mặc định' },
    { key: 'enable_notifications', value: 'true', description: 'Bật thông báo' },
    { key: 'auto_approve_orders', value: 'false', description: 'Tự động duyệt đơn hàng' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Cài Đặt Hệ Thống</h1>
        <p className="text-zinc-500 text-sm">Quản lý cấu hình và thiết lập hệ thống</p>
      </div>

      <div className="bg-white border border-zinc-300 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 bg-zinc-50">
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Khóa</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Mô tả</th>
              <th className="text-left px-4 py-3 text-zinc-700 font-medium">Giá trị</th>
              <th className="text-center px-4 py-3 text-zinc-700 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {defaultSettings.map(item => (
              <tr key={item.key} className="border-b border-zinc-200 hover:bg-zinc-50">
                <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{item.key}</td>
                <td className="px-4 py-3 text-zinc-700">{item.description}</td>
                <td className="px-4 py-3">
                  {editing === item.key ? (
                    <input
                      className="w-full px-2 py-1 border border-zinc-900 text-sm focus:outline-none"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="text-zinc-900">{item.value || <span className="text-zinc-300 italic">Chưa thiết lập</span>}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-center">
                    {editing === item.key ? (
                      <>
                        <button className="px-2 py-1 text-xs bg-zinc-900 text-white hover:bg-zinc-800" onClick={() => handleSave(item.key)}>Lưu</button>
                        <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => setEditing(null)}>Hủy</button>
                      </>
                    ) : (
                      <button className="px-2 py-1 text-xs border border-zinc-300 text-zinc-700 hover:bg-zinc-100" onClick={() => { setEditing(item.key); setEditValue(item.value) }}>Sửa</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
