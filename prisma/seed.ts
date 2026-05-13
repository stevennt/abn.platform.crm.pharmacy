import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up existing data...')
  await prisma.rolePermission.deleteMany()
  await prisma.navigationItem.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.lookup.deleteMany()
  await prisma.kpi.deleteMany()
  await prisma.complianceRecord.deleteMany()
  await prisma.taxSetting.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.priceList.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.purchaseOrderItem.deleteMany()
  await prisma.purchaseOrder.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.salesOrder.deleteMany()
  await prisma.stockBatch.deleteMany()
  await prisma.product.deleteMany()
  await prisma.masterProduct.deleteMany()
  await prisma.distributor.deleteMany()
  await prisma.territory.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.pharmacy.deleteMany()

  const hashedPassword = await bcrypt.hash('admin123', 10)

  // ── Pharmacies ──────────────────────────────────────────
  const pharmA = await prisma.pharmacy.create({
    data: { name: 'ABN Pharma', code: 'ABN', status: 'active' },
  })
  const pharmB = await prisma.pharmacy.create({
    data: { name: 'Mekong Pharma', code: 'MKP', status: 'active' },
  })
  console.log(`Created pharmacies: ${pharmA.name}, ${pharmB.name}`)

  // ── Master products (global catalog) ────────────────────
  const masterProductMap = await seedMasterProducts()

  // ── Pharmacy A: ABN Pharma ──────────────────────────────
  await seedPharmacy(pharmA.id, 'ABN', hashedPassword, masterProductMap)
  // ── Pharmacy B: Mekong Pharma ──────────────────────────
  await seedPharmacy(pharmB.id, 'MKP', hashedPassword, masterProductMap)

  // ── Global data (shared across all pharmacies) ──────────
  await seedLookups()
  await seedNavigation()
  await seedRolePermissions()

  console.log('\n✅ Seed completed successfully')
}

async function seedPharmacy(pharmacyId: number, prefix: string, hashedPassword: string, masterProductMap: Record<string, number> = {}) {
  console.log(`\n--- Seeding pharmacy ${prefix} (id=${pharmacyId}) ---`)

  // ── Users ──────────────────────────────────────────
  const users: Record<string, any> = {}
  const userDefs = [
    { code: `${prefix}-ADMIN`, name: 'Quản Trị Hệ Thống', email: `admin@${prefix.toLowerCase()}.com`, role: 'admin' },
    { code: `${prefix}-NV001`, name: 'Nguyễn Văn A', email: `warehouse@${prefix.toLowerCase()}.com`, role: 'warehouse', department: 'Kho', position: 'Quản lý kho' },
    { code: `${prefix}-NV002`, name: 'Trần Thị B', email: `sales@${prefix.toLowerCase()}.com`, role: 'sales', department: 'Bán hàng', position: 'Quản lý bán hàng' },
    { code: `${prefix}-NV003`, name: 'Lê Văn C', email: `rep@${prefix.toLowerCase()}.com`, role: 'pharmacy-rep', department: 'Trình dược viên', position: 'Trình dược viên' },
    { code: `${prefix}-NV004`, name: 'Phạm Thị D', email: `accountant@${prefix.toLowerCase()}.com`, role: 'accountant', department: 'Kế toán', position: 'Kế toán trưởng' },
    { code: `${prefix}-NV005`, name: 'Hoàng Văn E', email: `ceo@${prefix.toLowerCase()}.com`, role: 'ceo', department: 'Ban Giám đốc', position: 'Tổng Giám đốc' },
    { code: `${prefix}-NV006`, name: 'Nguyễn Thị F', email: `marketing@${prefix.toLowerCase()}.com`, role: 'marketing-manager', department: 'Marketing', position: 'Trưởng phòng Marketing' },
    { code: `${prefix}-NV007`, name: 'Trần Văn G', email: `distribution@${prefix.toLowerCase()}.com`, role: 'distribution', department: 'Phân phối', position: 'Quản lý phân phối' },
    { code: `${prefix}-NV008`, name: 'Lý Thị H', email: `customercare@${prefix.toLowerCase()}.com`, role: 'customer-care', department: 'Chăm sóc KH', position: 'Nhân viên CSKH' },
  ]
  for (const u of userDefs) {
    users[u.role] = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, pharmacyId, password: hashedPassword, status: 'active' },
    })
  }

  // ── Customers ──────────────────────────────────────
  const customerDefs = [
    { code: `${prefix}-KH001`, name: 'Nhà Thuốc An Khang', type: 'pharmacy', taxCode: '0123456789', phone: '0901234567', email: `contact@ankhang.${prefix.toLowerCase()}`, address: '123 Đường ABC, Quận 1, TP.HCM', region: 'south', creditLimit: 500000000 },
    { code: `${prefix}-KH002`, name: 'Bệnh Viện Đa Khoa Bình Minh', type: 'hospital', taxCode: '0987654321', phone: '0907654321', email: `mua@bvbinhminh.${prefix.toLowerCase()}`, address: '456 Đường XYZ, Quận 3, TP.HCM', region: 'south', creditLimit: 1000000000 },
    { code: `${prefix}-KH003`, name: 'Phòng Khám Đa Khoa An Phú', type: 'clinic', taxCode: '0876543210', phone: '0912345678', email: `info@anphu.${prefix.toLowerCase()}`, address: '789 Đường DEF, Quận 5, TP.HCM', region: 'south', creditLimit: 200000000 },
    { code: `${prefix}-KH004`, name: 'Công ty Dược phẩm Nam Hà', type: 'distributor', taxCode: '0765432109', phone: '0923456789', email: `order@namha.${prefix.toLowerCase()}`, address: '123 Đường GHI, Hà Nội', region: 'north', creditLimit: 800000000 },
    { code: `${prefix}-KH005`, name: 'Đại lý Thuốc Tây Sài Gòn', type: 'wholesaler', phone: '0934567890', email: `info@saigon.${prefix.toLowerCase()}`, address: '321 Đường KLM, Quận 10, TP.HCM', region: 'south', creditLimit: 300000000, status: 'potential' },
  ]
  const customers = await Promise.all(
    customerDefs.map(c => prisma.customer.upsert({
      where: { pharmacyId_code: { pharmacyId, code: c.code } },
      update: {},
      create: { ...c, pharmacyId, status: c.status || 'active' },
    }))
  )

  // ── Products ───────────────────────────────────────
  const productDefs = [
    { code: `${prefix}-SP001`, name: 'Paracetamol 500mg', activeIngredient: 'Paracetamol', category: 'otc', manufacturer: 'Công ty Dược phẩm ABC', unit: 'Viên', purchasePrice: 150, salePrice: 200, minStock: 500 },
    { code: `${prefix}-SP002`, name: 'Amoxicillin 250mg', activeIngredient: 'Amoxicillin', category: 'prescription', manufacturer: 'Công ty Dược phẩm XYZ', unit: 'Viên', purchasePrice: 350, salePrice: 500, minStock: 300 },
    { code: `${prefix}-SP003`, name: 'Insulin Glargine 100IU/ml', activeIngredient: 'Insulin Glargine', category: 'prescription', manufacturer: 'Pharma International', unit: 'Lọ', purchasePrice: 250000, salePrice: 350000, minStock: 50 },
    { code: `${prefix}-SP004`, name: 'Vitamin C 1000mg', activeIngredient: 'Ascorbic Acid', category: 'supplement', manufacturer: 'Công ty Dược phẩm ABC', unit: 'Viên', purchasePrice: 80, salePrice: 150, minStock: 1000 },
    { code: `${prefix}-SP005`, name: 'Khẩu trang y tế N95', activeIngredient: '', category: 'medical-device', manufacturer: 'Công ty TNHH Y tế', unit: 'Cái', purchasePrice: 5000, salePrice: 8000, minStock: 200 },
  ]
  const products = await Promise.all(
    productDefs.map(p => prisma.product.upsert({
      where: { pharmacyId_code: { pharmacyId, code: p.code } },
      update: {},
      create: {
        ...p,
        pharmacyId,
        masterProductId: masterProductMap[p.name] || null,
        status: 'active',
      },
    }))
  )

  // ── Stock batches ──────────────────────────────────
  const now = new Date()
  const nextYear = new Date(now.getFullYear() + 1, 11, 31)
  const midYear = new Date(now.getFullYear(), 6, 30)
  const nearDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000) // ~2 months out

  await Promise.all([
    prisma.stockBatch.create({
      data: { pharmacyId, productId: products[0].id, batchNumber: `${prefix}-LOT001`, expiryDate: nextYear, quantity: 5000, unit: 'Viên', purchasePrice: 150, salePrice: 200, status: 'in-stock' },
    }),
    prisma.stockBatch.create({
      data: { pharmacyId, productId: products[1].id, batchNumber: `${prefix}-LOT002`, expiryDate: midYear, quantity: 2000, unit: 'Viên', purchasePrice: 350, salePrice: 500, status: 'in-stock' },
    }),
    prisma.stockBatch.create({
      data: { pharmacyId, productId: products[2].id, batchNumber: `${prefix}-LOT003`, expiryDate: nearDate, quantity: 100, unit: 'Lọ', purchasePrice: 250000, salePrice: 350000, status: 'expiring' },
    }),
    prisma.stockBatch.create({
      data: { pharmacyId, productId: products[3].id, batchNumber: `${prefix}-LOT004`, expiryDate: new Date(now.getFullYear() + 3, 4, 20), quantity: 10000, unit: 'Viên', purchasePrice: 80, salePrice: 150, status: 'in-stock' },
    }),
    prisma.stockBatch.create({
      data: { pharmacyId, productId: products[4].id, batchNumber: `${prefix}-LOT005`, expiryDate: nextYear, quantity: 500, unit: 'Cái', purchasePrice: 5000, salePrice: 8000, status: 'in-stock' },
    }),
  ])

  // ── Sales orders ───────────────────────────────────
  const _order1 = await prisma.salesOrder.create({
    data: {
      pharmacyId, code: `${prefix}-DH001`, customerId: customers[0].id, salesPersonId: users['sales'].id,
      orderDate: new Date('2024-01-20'), totalAmount: 200000, status: 'confirmed',
      items: { create: [{ pharmacyId, productId: products[0].id, quantity: 1000, unitPrice: 200, totalPrice: 200000 }] },
    },
  })
  const _order2 = await prisma.salesOrder.create({
    data: {
      pharmacyId, code: `${prefix}-DH002`, customerId: customers[1].id, salesPersonId: users['sales'].id,
      orderDate: new Date('2024-01-18'), totalAmount: 1750000, status: 'processing',
      items: { create: [{ pharmacyId, productId: products[2].id, quantity: 5, unitPrice: 350000, totalPrice: 1750000 }] },
    },
  })

  // ── Purchase orders ────────────────────────────────
  await prisma.purchaseOrder.create({
    data: {
      pharmacyId, code: `${prefix}-PM001`, supplierName: 'Công ty Dược phẩm ABC',
      orderDate: new Date('2024-01-15'), totalAmount: 7500000, priority: 'normal', status: 'approved',
      createdById: users['warehouse'].id,
      items: { create: [{ pharmacyId, productId: products[0].id, quantity: 50000, unitPrice: 150, totalPrice: 7500000 }] },
    },
  })
  await prisma.purchaseOrder.create({
    data: {
      pharmacyId, code: `${prefix}-PM002`, supplierName: 'Pharma International',
      orderDate: new Date('2024-01-10'), totalAmount: 50000000, priority: 'urgent', status: 'pending',
      createdById: users['warehouse'].id,
      items: { create: [{ pharmacyId, productId: products[2].id, quantity: 200, unitPrice: 250000, totalPrice: 50000000 }] },
    },
  })

  // ── Distributors ───────────────────────────────────
  await Promise.all([
    prisma.distributor.create({
      data: { pharmacyId, code: `${prefix}-DL001`, name: 'Công ty TNHH Dược phẩm Miền Bắc', type: 'exclusive', region: 'north', revenue: 45000000, commission: 3600000, status: 'active', contractDate: new Date('2023-01-15') },
    }),
    prisma.distributor.create({
      data: { pharmacyId, code: `${prefix}-DL002`, name: 'Nhà thuốc FPT Long Châu', type: 'non-exclusive', region: 'south', revenue: 78000000, commission: 6200000, status: 'active', contractDate: new Date('2023-03-20') },
    }),
    prisma.distributor.create({
      data: { pharmacyId, code: `${prefix}-DL003`, name: 'Công ty Dược phẩm Trung Ương', type: 'exclusive', region: 'central', revenue: 35000000, commission: 2800000, status: 'active', contractDate: new Date('2023-06-10') },
    }),
  ])

  // ── Territories ────────────────────────────────────
  await Promise.all([
    prisma.territory.create({ data: { pharmacyId, name: 'Hà Nội', managerId: users['pharmacy-rep'].id, customerCount: 45, revenue: 2500000000, potential: 'high' } }),
    prisma.territory.create({ data: { pharmacyId, name: 'TP.HCM', managerId: users['pharmacy-rep'].id, customerCount: 62, revenue: 3800000000, potential: 'very-high' } }),
    prisma.territory.create({ data: { pharmacyId, name: 'Đà Nẵng', customerCount: 28, revenue: 1200000000, potential: 'medium' } }),
  ])

  // ── KPIs ───────────────────────────────────────────
  await prisma.kpi.create({
    data: { pharmacyId, userId: users['sales'].id, period: 'monthly', revenueTarget: 100000000, revenueActual: 120000000, customerTarget: 20, customerActual: 18, orderTarget: 50, orderActual: 45, totalScore: 85, periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-31') },
  })
  await prisma.kpi.create({
    data: { pharmacyId, userId: users['pharmacy-rep'].id, period: 'monthly', revenueTarget: 120000000, revenueActual: 150000000, customerTarget: 25, customerActual: 28, orderTarget: 60, orderActual: 55, totalScore: 92, periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-01-31') },
  })

  // ── Promotions ─────────────────────────────────────
  await prisma.promotion.create({
    data: { pharmacyId, code: `${prefix}-KM001`, name: 'Giảm 10% thuốc OTC', type: 'discount', value: 10, startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31'), status: 'active' },
  })
  await prisma.promotion.create({
    data: { pharmacyId, code: `${prefix}-KM002`, name: 'Combo Vitamin C + Khẩu trang', type: 'combo', value: 15, startDate: new Date('2024-02-01'), endDate: new Date('2024-04-30'), status: 'active' },
  })

  // ── Tax settings ───────────────────────────────────
  await prisma.taxSetting.create({ data: { pharmacyId, name: 'VAT 5%', rate: 5, type: 'vat', status: 'active' } })
  await prisma.taxSetting.create({ data: { pharmacyId, name: 'VAT 8%', rate: 8, type: 'vat', status: 'active' } })
  await prisma.taxSetting.create({ data: { pharmacyId, name: 'VAT 10%', rate: 10, type: 'vat', status: 'active' } })

  // ── Compliance records ─────────────────────────────
  await prisma.complianceRecord.create({
    data: { pharmacyId, type: 'license', title: 'Giấy phép kinh doanh dược', status: 'active', expiryDate: new Date('2025-12-31') },
  })
  await prisma.complianceRecord.create({
    data: { pharmacyId, type: 'audit', title: 'Kiểm tra định kỳ Q1/2024', status: 'active' },
  })

  // ── Settings ───────────────────────────────────────
  const defaultSettings = [
    { key: 'company_name', value: `${prefix === 'ABN' ? 'ABN Pharma' : 'Mekong Pharma'} CRM`, description: 'Tên công ty' },
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
  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { pharmacyId_key: { pharmacyId, key: s.key } },
      update: { value: s.value, description: s.description },
      create: { ...s, pharmacyId },
    })
  }

  console.log(`  ✓ ${userDefs.length} users, ${customers.length} customers, ${products.length} products`)
  console.log(`  ✓ stock batches, ${prefix === 'ABN' ? 2 : '2'} sales orders, 2 purchase orders`)
  console.log(`  ✓ 3 distributors, territories, KPIs, promotions, tax settings, compliance, settings`)
}

async function seedMasterProducts(): Promise<Record<string, number>> {
  console.log('\n--- Seeding master product catalog ---')
  const defs = [
    { code: 'MP-SP001', name: 'Paracetamol 500mg', activeIngredient: 'Paracetamol', category: 'otc', manufacturer: 'Công ty Dược phẩm ABC', unit: 'Viên' },
    { code: 'MP-SP002', name: 'Amoxicillin 250mg', activeIngredient: 'Amoxicillin', category: 'prescription', manufacturer: 'Công ty Dược phẩm XYZ', unit: 'Viên' },
    { code: 'MP-SP003', name: 'Insulin Glargine 100IU/ml', activeIngredient: 'Insulin Glargine', category: 'prescription', manufacturer: 'Pharma International', unit: 'Lọ' },
    { code: 'MP-SP004', name: 'Vitamin C 1000mg', activeIngredient: 'Ascorbic Acid', category: 'supplement', manufacturer: 'Công ty Dược phẩm ABC', unit: 'Viên' },
    { code: 'MP-SP005', name: 'Khẩu trang y tế N95', activeIngredient: '', category: 'medical-device', manufacturer: 'Công ty TNHH Y tế', unit: 'Cái' },
  ]
  const map: Record<string, number> = {}
  for (const d of defs) {
    const mp = await prisma.masterProduct.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    })
    map[mp.name] = mp.id
  }
  console.log(`  ✓ ${defs.length} master products`)
  return map
}

async function seedLookups() {
  const lookupData: { category: string; value: string; label: string; color?: string; sortOrder: number }[] = [
    { category: 'customer_type', value: 'pharmacy', label: 'Nhà thuốc', sortOrder: 1 },
    { category: 'customer_type', value: 'hospital', label: 'Bệnh viện', sortOrder: 2 },
    { category: 'customer_type', value: 'clinic', label: 'Phòng khám', sortOrder: 3 },
    { category: 'customer_type', value: 'distributor', label: 'Nhà phân phối', sortOrder: 4 },
    { category: 'customer_type', value: 'wholesaler', label: 'Đại lý sỉ', sortOrder: 5 },
    { category: 'customer_type', value: 'retailer', label: 'Bán lẻ', sortOrder: 6 },
    { category: 'customer_region', value: 'north', label: 'Miền Bắc', sortOrder: 1 },
    { category: 'customer_region', value: 'central', label: 'Miền Trung', sortOrder: 2 },
    { category: 'customer_region', value: 'south', label: 'Miền Nam', sortOrder: 3 },
    { category: 'customer_region', value: 'highlands', label: 'Tây Nguyên', sortOrder: 4 },
    { category: 'customer_status', value: 'active', label: 'Hoạt động', sortOrder: 1 },
    { category: 'customer_status', value: 'inactive', label: 'Không hoạt động', sortOrder: 2 },
    { category: 'customer_status', value: 'potential', label: 'Tiềm năng', sortOrder: 3 },
    { category: 'customer_status', value: 'blocked', label: 'Bị chặn', sortOrder: 4 },
    { category: 'product_category', value: 'prescription', label: 'Thuốc kê đơn', sortOrder: 1 },
    { category: 'product_category', value: 'otc', label: 'Thuốc OTC', sortOrder: 2 },
    { category: 'product_category', value: 'supplement', label: 'Thực phẩm chức năng', sortOrder: 3 },
    { category: 'product_category', value: 'medical-device', label: 'Trang thiết bị y tế', sortOrder: 4 },
    { category: 'product_category', value: 'consumable', label: 'Vật tư tiêu hao', sortOrder: 5 },
    { category: 'product_status', value: 'active', label: 'Hoạt động', sortOrder: 1 },
    { category: 'product_status', value: 'inactive', label: 'Ngừng kinh doanh', sortOrder: 2 },
    { category: 'product_status', value: 'discontinued', label: 'Ngừng sản xuất', sortOrder: 3 },
    { category: 'inventory_status', value: 'in-stock', label: 'Còn hàng', color: 'bg-green-100 text-green-800', sortOrder: 1 },
    { category: 'inventory_status', value: 'low-stock', label: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800', sortOrder: 2 },
    { category: 'inventory_status', value: 'expiring', label: 'Sắp hết hạn', color: 'bg-orange-100 text-orange-800', sortOrder: 3 },
    { category: 'inventory_status', value: 'expired', label: 'Hết hạn', color: 'bg-red-100 text-red-800', sortOrder: 4 },
    { category: 'inventory_status', value: 'out-of-stock', label: 'Hết hàng', color: 'bg-gray-100 text-gray-800', sortOrder: 5 },
    { category: 'warehouse', value: 'main', label: 'Kho chính', sortOrder: 1 },
    { category: 'warehouse', value: 'cold', label: 'Kho lạnh', sortOrder: 2 },
    { category: 'warehouse', value: 'quarantine', label: 'Kho cách ly', sortOrder: 3 },
    { category: 'warehouse', value: 'return', label: 'Kho hàng trả', sortOrder: 4 },
    { category: 'order_status', value: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', sortOrder: 1 },
    { category: 'order_status', value: 'confirmed', label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', sortOrder: 2 },
    { category: 'order_status', value: 'processing', label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800', sortOrder: 3 },
    { category: 'order_status', value: 'shipped', label: 'Đã giao', color: 'bg-purple-100 text-purple-800', sortOrder: 4 },
    { category: 'order_status', value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800', sortOrder: 5 },
    { category: 'order_status', value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800', sortOrder: 6 },
    { category: 'po_status', value: 'draft', label: 'Nháp', color: 'bg-gray-100 text-gray-800', sortOrder: 1 },
    { category: 'po_status', value: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', sortOrder: 2 },
    { category: 'po_status', value: 'approved', label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', sortOrder: 3 },
    { category: 'po_status', value: 'ordered', label: 'Đã đặt', color: 'bg-indigo-100 text-indigo-800', sortOrder: 4 },
    { category: 'po_status', value: 'delivered', label: 'Đã giao', color: 'bg-purple-100 text-purple-800', sortOrder: 5 },
    { category: 'po_status', value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800', sortOrder: 6 },
    { category: 'po_status', value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800', sortOrder: 7 },
    { category: 'priority', value: 'low', label: 'Thấp', color: 'bg-gray-100 text-gray-800', sortOrder: 1 },
    { category: 'priority', value: 'normal', label: 'Bình thường', color: 'bg-blue-100 text-blue-800', sortOrder: 2 },
    { category: 'priority', value: 'high', label: 'Cao', color: 'bg-orange-100 text-orange-800', sortOrder: 3 },
    { category: 'priority', value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-100 text-red-800', sortOrder: 4 },
    { category: 'distributor_type', value: 'exclusive', label: 'Đại lý độc quyền', sortOrder: 1 },
    { category: 'distributor_type', value: 'non-exclusive', label: 'Không độc quyền', sortOrder: 2 },
    { category: 'distributor_type', value: 'general', label: 'Đại lý tổng hợp', sortOrder: 3 },
    { category: 'distributor_type', value: 'sub', label: 'Đại lý cấp 2', sortOrder: 4 },
    { category: 'distributor_type', value: 'retail', label: 'Cửa hàng bán lẻ', sortOrder: 5 },
    { category: 'distributor_status', value: 'active', label: 'Hoạt động', sortOrder: 1 },
    { category: 'distributor_status', value: 'inactive', label: 'Ngừng hợp tác', sortOrder: 2 },
    { category: 'distributor_status', value: 'suspended', label: 'Tạm ngưng', sortOrder: 3 },
    { category: 'employee_status', value: 'active', label: 'Đang làm việc', sortOrder: 1 },
    { category: 'employee_status', value: 'inactive', label: 'Đã nghỉ', sortOrder: 2 },
    { category: 'employee_status', value: 'probation', label: 'Thử việc', sortOrder: 3 },
    { category: 'employee_role', value: 'sales', label: 'Kinh doanh', sortOrder: 1 },
    { category: 'employee_role', value: 'pharmacy-rep', label: 'Dược sĩ', sortOrder: 2 },
    { category: 'promotion_type', value: 'discount', label: 'Giảm giá', sortOrder: 1 },
    { category: 'promotion_type', value: 'combo', label: 'Combo', sortOrder: 2 },
    { category: 'promotion_type', value: 'campaign', label: 'Chiến dịch', sortOrder: 3 },
    { category: 'promotion_type', value: 'buy_x_get_y', label: 'Mua X tặng Y', sortOrder: 4 },
    { category: 'promotion_type', value: 'free_ship', label: 'Miễn phí vận chuyển', sortOrder: 5 },
    { category: 'promotion_type', value: 'voucher', label: 'Voucher', sortOrder: 6 },
    { category: 'promotion_type', value: 'seasonal', label: 'Theo mùa', sortOrder: 7 },
    { category: 'promotion_status', value: 'active', label: 'Đang áp dụng', sortOrder: 1 },
    { category: 'promotion_status', value: 'scheduled', label: 'Sắp diễn ra', sortOrder: 2 },
    { category: 'promotion_status', value: 'expired', label: 'Đã kết thúc', sortOrder: 3 },
    { category: 'promotion_status', value: 'cancelled', label: 'Đã hủy', sortOrder: 4 },
    { category: 'price_type', value: 'wholesale', label: 'Giá bán sỉ', sortOrder: 1 },
    { category: 'price_type', value: 'retail', label: 'Giá bán lẻ', sortOrder: 2 },
    { category: 'price_type', value: 'special', label: 'Giá đặc biệt', sortOrder: 3 },
    { category: 'price_type', value: 'contract', label: 'Giá hợp đồng', sortOrder: 4 },
    { category: 'price_status', value: 'active', label: 'Đang áp dụng', sortOrder: 1 },
    { category: 'price_status', value: 'pending', label: 'Chờ áp dụng', sortOrder: 2 },
    { category: 'price_status', value: 'expired', label: 'Hết hiệu lực', sortOrder: 3 },
    { category: 'compliance_type', value: 'license', label: 'Giấy phép kinh doanh', sortOrder: 1 },
    { category: 'compliance_type', value: 'audit', label: 'Kiểm tra', sortOrder: 2 },
    { category: 'compliance_type', value: 'regulatory-report', label: 'Báo cáo', sortOrder: 3 },
    { category: 'compliance_type', value: 'certificate', label: 'Chứng chỉ hành nghề', sortOrder: 4 },
    { category: 'compliance_type', value: 'inspection', label: 'Kiểm tra chất lượng', sortOrder: 5 },
    { category: 'compliance_type', value: 'gpp', label: 'Chứng nhận GPP', sortOrder: 6 },
    { category: 'compliance_type', value: 'gdp', label: 'Chứng nhận GDP', sortOrder: 7 },
    { category: 'compliance_type', value: 'other', label: 'Khác', sortOrder: 8 },
    { category: 'compliance_status', value: 'valid', label: 'Còn hiệu lực', color: 'bg-green-100 text-green-800', sortOrder: 1 },
    { category: 'compliance_status', value: 'expiring', label: 'Sắp hết hạn', color: 'bg-yellow-100 text-yellow-800', sortOrder: 2 },
    { category: 'compliance_status', value: 'expired', label: 'Hết hạn', color: 'bg-red-100 text-red-800', sortOrder: 3 },
    { category: 'compliance_status', value: 'pending', label: 'Chờ cấp', color: 'bg-gray-100 text-gray-800', sortOrder: 4 },
    { category: 'compliance_status', value: 'revoked', label: 'Đã thu hồi', color: 'bg-red-100 text-red-800', sortOrder: 5 },
    { category: 'tax_type', value: 'vat', label: 'VAT', sortOrder: 1 },
    { category: 'tax_type', value: 'special', label: 'Thuế tiêu thụ đặc biệt', sortOrder: 2 },
    { category: 'tax_type', value: 'import', label: 'Thuế nhập khẩu', sortOrder: 3 },
    { category: 'tax_status', value: 'active', label: 'Đang áp dụng', sortOrder: 1 },
    { category: 'tax_status', value: 'inactive', label: 'Ngừng áp dụng', sortOrder: 2 },
  ]
  for (const lookup of lookupData) {
    await prisma.lookup.upsert({
      where: { category_value: { category: lookup.category, value: lookup.value } },
      update: { label: lookup.label, color: lookup.color ?? null, sortOrder: lookup.sortOrder },
      create: lookup,
    })
  }
  console.log(`  ✓ ${lookupData.length} lookup values`)
}

async function seedNavigation() {
  const navItemData = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', permission: 'dashboard:read', sortOrder: 1 },
    { href: '/customers', label: 'Quản Lý Khách Hàng', icon: '👥', permission: 'customers:read', sortOrder: 2 },
    { href: '/products', label: 'Danh Mục Thuốc', icon: '💊', permission: 'products:read', sortOrder: 3 },
    { href: '/master-products', label: 'Danh Mục Chung', icon: '📋', permission: 'products:read', sortOrder: 4 },
    { href: '/inventory', label: 'Quản Lý Kho', icon: '🏭', permission: 'inventory:read', sortOrder: 5 },
    { href: '/sales-orders', label: 'Đơn Hàng Bán', icon: '🛒', permission: 'sales-orders:read', sortOrder: 6 },
    { href: '/purchase-orders', label: 'Đơn Hàng Mua', icon: '📄', permission: 'purchase-orders:read', sortOrder: 7 },
    { href: '/distribution', label: 'Phân Phối - Đại Lý', icon: '🚚', permission: 'distribution:read', sortOrder: 8 },
    { href: '/sales-team', label: 'Đội Ngũ Sales', icon: '👔', permission: 'sales-team:read', sortOrder: 9 },
    { href: '/promotions', label: 'Chương Trình KM', icon: '🏷️', permission: 'promotions:read', sortOrder: 10 },
    { href: '/pricing', label: 'Quản Lý Giá', icon: '💰', permission: 'pricing:read', sortOrder: 11 },
    { href: '/compliance', label: 'Tuân Thủ Quy Định', icon: '🛡️', permission: 'compliance:read', sortOrder: 12 },
    { href: '/reports', label: 'Báo Cáo & Phân Tích', icon: '📈', permission: 'reports:read', sortOrder: 13 },
    { href: '/tax', label: 'Quản Lý Thuế', icon: '🧮', permission: 'tax:read', sortOrder: 14 },
    { href: '/settings', label: 'Cài Đặt Hệ Thống', icon: '⚙️', permission: 'settings:read', sortOrder: 15 },
  ]
  for (const nav of navItemData) {
    await prisma.navigationItem.upsert({
      where: { href: nav.href },
      update: { label: nav.label, icon: nav.icon, permission: nav.permission, sortOrder: nav.sortOrder, isActive: true },
      create: nav,
    })
  }
  console.log(`  ✓ ${navItemData.length} navigation items`)
}

async function seedRolePermissions() {
  const rolePermissionData: { permission: string; role: string }[] = [
    { permission: '*', role: 'admin' },
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care', 'ceo', 'marketing-manager'].map(r => ({ permission: 'dashboard:read', role: r })),
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care', 'ceo', 'marketing-manager'].map(r => ({ permission: 'customers:read', role: r })),
    ...['admin', 'sales', 'pharmacy-rep'].map(r => ({ permission: 'customers:write', role: r })),
    ...['admin'].map(r => ({ permission: 'customers:delete', role: r })),
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'ceo', 'marketing-manager'].map(r => ({ permission: 'products:read', role: r })),
    ...['admin', 'warehouse'].map(r => ({ permission: 'products:write', role: r })),
    ...['admin'].map(r => ({ permission: 'products:delete', role: r })),
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'ceo'].map(r => ({ permission: 'inventory:read', role: r })),
    ...['admin', 'warehouse'].map(r => ({ permission: 'inventory:write', role: r })),
    ...['admin', 'sales', 'pharmacy-rep', 'accountant', 'ceo', 'marketing-manager'].map(r => ({ permission: 'sales-orders:read', role: r })),
    ...['admin', 'sales', 'pharmacy-rep'].map(r => ({ permission: 'sales-orders:write', role: r })),
    ...['admin'].map(r => ({ permission: 'sales-orders:delete', role: r })),
    ...['admin', 'warehouse', 'accountant', 'ceo'].map(r => ({ permission: 'purchase-orders:read', role: r })),
    ...['admin', 'warehouse'].map(r => ({ permission: 'purchase-orders:write', role: r })),
    ...['admin'].map(r => ({ permission: 'purchase-orders:delete', role: r })),
    ...['admin', 'distribution', 'sales', 'ceo', 'marketing-manager'].map(r => ({ permission: 'distribution:read', role: r })),
    ...['admin', 'distribution', 'marketing-manager'].map(r => ({ permission: 'distribution:write', role: r })),
    ...['admin', 'sales', 'distribution', 'ceo'].map(r => ({ permission: 'sales-team:read', role: r })),
    ...['admin', 'sales'].map(r => ({ permission: 'sales-team:write', role: r })),
    ...['admin', 'sales', 'pharmacy-rep', 'ceo'].map(r => ({ permission: 'kpi:read', role: r })),
    ...['admin', 'sales'].map(r => ({ permission: 'kpi:write', role: r })),
    ...['admin', 'distribution', 'sales', 'ceo', 'marketing-manager'].map(r => ({ permission: 'promotions:read', role: r })),
    ...['admin', 'distribution', 'marketing-manager'].map(r => ({ permission: 'promotions:write', role: r })),
    ...['admin', 'sales', 'warehouse', 'accountant', 'ceo', 'marketing-manager'].map(r => ({ permission: 'pricing:read', role: r })),
    ...['admin', 'marketing-manager'].map(r => ({ permission: 'pricing:write', role: r })),
    ...['admin', 'warehouse', 'ceo'].map(r => ({ permission: 'compliance:read', role: r })),
    ...['admin'].map(r => ({ permission: 'compliance:write', role: r })),
    ...['admin', 'sales', 'warehouse', 'accountant', 'distribution', 'ceo', 'marketing-manager'].map(r => ({ permission: 'reports:read', role: r })),
    ...['admin', 'accountant', 'ceo'].map(r => ({ permission: 'tax:read', role: r })),
    ...['admin', 'accountant'].map(r => ({ permission: 'tax:write', role: r })),
    ...['admin', 'ceo'].map(r => ({ permission: 'settings:read', role: r })),
    ...['admin'].map(r => ({ permission: 'settings:write', role: r })),
    ...['admin', 'ceo', 'sales'].map(r => ({ permission: 'users:read', role: r })),
    ...['admin', 'ceo', 'sales'].map(r => ({ permission: 'users:write', role: r })),
  ]
  for (const rp of rolePermissionData) {
    await prisma.rolePermission.upsert({
      where: { role_permission: { role: rp.role, permission: rp.permission } },
      update: {},
      create: rp,
    })
  }
  console.log(`  ✓ ${rolePermissionData.length} role permissions`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
