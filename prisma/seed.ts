import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up non-user data for idempotent re-seeding
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
  await prisma.distributor.deleteMany()
  await prisma.territory.deleteMany()
  await prisma.customer.deleteMany()

  const hashedPassword = await bcrypt.hash('admin123', 10)
  // Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@pharmacrm.com' },
    update: {},
    create: {
      code: 'ADMIN001',
      name: 'Quản Trị Hệ Thống',
      email: 'admin@pharmacrm.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    },
  })

  const warehouseManager = await prisma.user.upsert({
    where: { email: 'warehouse@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV001',
      name: 'Nguyễn Văn A',
      email: 'warehouse@pharmacrm.com',
      password: hashedPassword,
      role: 'warehouse',
      department: 'Kho',
      position: 'Quản lý kho',
      status: 'active',
    },
  })

  const salesManager = await prisma.user.upsert({
    where: { email: 'sales@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV002',
      name: 'Trần Thị B',
      email: 'sales@pharmacrm.com',
      password: hashedPassword,
      role: 'sales',
      department: 'Bán hàng',
      position: 'Quản lý bán hàng',
      status: 'active',
    },
  })

  const pharmaRep = await prisma.user.upsert({
    where: { email: 'rep@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV003',
      name: 'Lê Văn C',
      email: 'rep@pharmacrm.com',
      password: hashedPassword,
      role: 'pharmacy-rep',
      department: 'Trình dược viên',
      position: 'Trình dược viên',
      status: 'active',
    },
  })

  await prisma.user.upsert({
    where: { email: 'accountant@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV004',
      name: 'Phạm Thị D',
      email: 'accountant@pharmacrm.com',
      password: hashedPassword,
      role: 'accountant',
      department: 'Kế toán',
      position: 'Kế toán trưởng',
      status: 'active',
    },
  })

  await prisma.user.upsert({
    where: { email: 'ceo@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV005',
      name: 'Hoàng Văn E',
      email: 'ceo@pharmacrm.com',
      password: hashedPassword,
      role: 'ceo',
      department: 'Ban Giám đốc',
      position: 'Tổng Giám đốc',
      status: 'active',
    },
  })

  await prisma.user.upsert({
    where: { email: 'marketing@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV006',
      name: 'Nguyễn Thị F',
      email: 'marketing@pharmacrm.com',
      password: hashedPassword,
      role: 'marketing-manager',
      department: 'Marketing',
      position: 'Trưởng phòng Marketing',
      status: 'active',
    },
  })

  await prisma.user.upsert({
    where: { email: 'distribution@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV007',
      name: 'Trần Văn G',
      email: 'distribution@pharmacrm.com',
      password: hashedPassword,
      role: 'distribution',
      department: 'Phân phối',
      position: 'Quản lý phân phối',
      status: 'active',
    },
  })

  await prisma.user.upsert({
    where: { email: 'customercare@pharmacrm.com' },
    update: {},
    create: {
      code: 'NV008',
      name: 'Lý Thị H',
      email: 'customercare@pharmacrm.com',
      password: hashedPassword,
      role: 'customer-care',
      department: 'Chăm sóc KH',
      position: 'Nhân viên CSKH',
      status: 'active',
    },
  })

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        code: 'KH001',
        name: 'Nhà Thuốc An Khang',
        type: 'pharmacy',
        taxCode: '0123456789',
        phone: '0901234567',
        email: 'contact@ankhang.com',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        region: 'south',
        creditLimit: 500000000,
        status: 'active',
      },
    }),
    prisma.customer.create({
      data: {
        code: 'KH002',
        name: 'Bệnh Viện Đa Khoa Bình Minh',
        type: 'hospital',
        taxCode: '0987654321',
        phone: '0907654321',
        email: 'mua@bvbinhminh.com',
        address: '456 Đường XYZ, Quận 3, TP.HCM',
        region: 'south',
        creditLimit: 1000000000,
        status: 'active',
      },
    }),
    prisma.customer.create({
      data: {
        code: 'KH003',
        name: 'Phòng Khám Đa Khoa An Phú',
        type: 'clinic',
        taxCode: '0876543210',
        phone: '0912345678',
        email: 'info@phongkhamanphu.com',
        address: '789 Đường DEF, Quận 5, TP.HCM',
        region: 'south',
        creditLimit: 200000000,
        status: 'active',
      },
    }),
    prisma.customer.create({
      data: {
        code: 'KH004',
        name: 'Công ty Dược phẩm Nam Hà',
        type: 'distributor',
        taxCode: '0765432109',
        phone: '0923456789',
        email: 'order@namha.com',
        address: '123 Đường GHI, Hà Nội',
        region: 'north',
        creditLimit: 800000000,
        status: 'active',
      },
    }),
    prisma.customer.create({
      data: {
        code: 'KH005',
        name: 'Đại lý Thuốc Tây Sài Gòn',
        type: 'wholesaler',
        phone: '0934567890',
        address: '321 Đường KLM, Quận 10, TP.HCM',
        region: 'south',
        creditLimit: 300000000,
        status: 'potential',
      },
    }),
  ])

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        code: 'SP001',
        name: 'Paracetamol 500mg',
        activeIngredient: 'Paracetamol',
        category: 'otc',
        manufacturer: 'Công ty Dược phẩm ABC',
        unit: 'Viên',
        purchasePrice: 150,
        salePrice: 200,
        minStock: 500,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        code: 'SP002',
        name: 'Amoxicillin 250mg',
        activeIngredient: 'Amoxicillin',
        category: 'prescription',
        manufacturer: 'Công ty Dược phẩm XYZ',
        unit: 'Viên',
        purchasePrice: 350,
        salePrice: 500,
        minStock: 300,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        code: 'SP003',
        name: 'Insulin Glargine 100IU/ml',
        activeIngredient: 'Insulin Glargine',
        category: 'prescription',
        manufacturer: 'Pharma International',
        unit: 'Lọ',
        purchasePrice: 250000,
        salePrice: 350000,
        minStock: 50,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        code: 'SP004',
        name: 'Vitamin C 1000mg',
        activeIngredient: 'Ascorbic Acid',
        category: 'supplement',
        manufacturer: 'Công ty Dược phẩm ABC',
        unit: 'Viên',
        purchasePrice: 80,
        salePrice: 150,
        minStock: 1000,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        code: 'SP005',
        name: 'Khẩu trang y tế N95',
        activeIngredient: '',
        category: 'medical-device',
        manufacturer: 'Công ty TNHH Y tế',
        unit: 'Cái',
        purchasePrice: 5000,
        salePrice: 8000,
        minStock: 200,
        status: 'active',
      },
    }),
  ])

  // Create stock batches
  await Promise.all([
    prisma.stockBatch.create({
      data: {
        productId: products[0].id,
        batchNumber: 'LOT001-2024',
        expiryDate: new Date('2026-12-31'),
        quantity: 5000,
        unit: 'Viên',
        purchasePrice: 150,
        salePrice: 200,
        status: 'in-stock',
      },
    }),
    prisma.stockBatch.create({
      data: {
        productId: products[1].id,
        batchNumber: 'LOT002-2024',
        expiryDate: new Date('2025-06-30'),
        quantity: 2000,
        unit: 'Viên',
        purchasePrice: 350,
        salePrice: 500,
        status: 'in-stock',
      },
    }),
    prisma.stockBatch.create({
      data: {
        productId: products[2].id,
        batchNumber: 'LOT003-2024',
        expiryDate: new Date('2025-03-15'),
        quantity: 100,
        unit: 'Lọ',
        purchasePrice: 250000,
        salePrice: 350000,
        status: 'expiring',
      },
    }),
    prisma.stockBatch.create({
      data: {
        productId: products[3].id,
        batchNumber: 'LOT004-2024',
        expiryDate: new Date('2027-05-20'),
        quantity: 10000,
        unit: 'Viên',
        purchasePrice: 80,
        salePrice: 150,
        status: 'in-stock',
      },
    }),
    prisma.stockBatch.create({
      data: {
        productId: products[4].id,
        batchNumber: 'LOT005-2024',
        expiryDate: new Date('2026-01-01'),
        quantity: 500,
        unit: 'Cái',
        purchasePrice: 5000,
        salePrice: 8000,
        status: 'in-stock',
      },
    }),
  ])

  // Create sales orders
  const order1 = await prisma.salesOrder.create({
    data: {
      code: 'DH001',
      customerId: customers[0].id,
      salesPersonId: salesManager.id,
      orderDate: new Date('2024-01-20'),
      totalAmount: 200000,
      status: 'confirmed',
      items: {
        create: [{ productId: products[0].id, quantity: 1000, unitPrice: 200, totalPrice: 200000 }],
      },
    },
  })

  const order2 = await prisma.salesOrder.create({
    data: {
      code: 'DH002',
      customerId: customers[1].id,
      salesPersonId: salesManager.id,
      orderDate: new Date('2024-01-18'),
      totalAmount: 1750000,
      status: 'processing',
      items: {
        create: [
          { productId: products[2].id, quantity: 5, unitPrice: 350000, totalPrice: 1750000 },
        ],
      },
    },
  })

  // Create purchase orders
  await prisma.purchaseOrder.create({
    data: {
      code: 'PM001',
      supplierName: 'Công ty Dược phẩm ABC',
      orderDate: new Date('2024-01-15'),
      totalAmount: 7500000,
      priority: 'normal',
      status: 'approved',
      createdById: warehouseManager.id,
      items: {
        create: [
          { productId: products[0].id, quantity: 50000, unitPrice: 150, totalPrice: 7500000 },
        ],
      },
    },
  })

  await prisma.purchaseOrder.create({
    data: {
      code: 'PM002',
      supplierName: 'Pharma International',
      orderDate: new Date('2024-01-10'),
      totalAmount: 50000000,
      priority: 'urgent',
      status: 'pending',
      createdById: warehouseManager.id,
      items: {
        create: [
          { productId: products[2].id, quantity: 200, unitPrice: 250000, totalPrice: 50000000 },
        ],
      },
    },
  })

  // Create distributors
  await Promise.all([
    prisma.distributor.create({
      data: {
        code: 'DL001',
        name: 'Công ty TNHH Dược phẩm Miền Bắc',
        type: 'exclusive',
        region: 'north',
        revenue: 45000000,
        commission: 3600000,
        status: 'active',
        contractDate: new Date('2023-01-15'),
      },
    }),
    prisma.distributor.create({
      data: {
        code: 'DL002',
        name: 'Nhà thuốc FPT Long Châu',
        type: 'non-exclusive',
        region: 'south',
        revenue: 78000000,
        commission: 6200000,
        status: 'active',
        contractDate: new Date('2023-03-20'),
      },
    }),
    prisma.distributor.create({
      data: {
        code: 'DL003',
        name: 'Công ty Dược phẩm Trung Ương',
        type: 'exclusive',
        region: 'central',
        revenue: 35000000,
        commission: 2800000,
        status: 'active',
        contractDate: new Date('2023-06-10'),
      },
    }),
  ])

  // Create territories
  await Promise.all([
    prisma.territory.create({
      data: {
        name: 'Hà Nội',
        managerId: pharmaRep.id,
        customerCount: 45,
        revenue: 2500000000,
        potential: 'high',
      },
    }),
    prisma.territory.create({
      data: {
        name: 'TP.HCM',
        managerId: pharmaRep.id,
        customerCount: 62,
        revenue: 3800000000,
        potential: 'very-high',
      },
    }),
    prisma.territory.create({
      data: {
        name: 'Đà Nẵng',
        customerCount: 28,
        revenue: 1200000000,
        potential: 'medium',
      },
    }),
  ])

  // Create KPIs
  await prisma.kpi.create({
    data: {
      userId: salesManager.id,
      period: 'monthly',
      revenueTarget: 100000000,
      revenueActual: 120000000,
      customerTarget: 20,
      customerActual: 18,
      orderTarget: 50,
      orderActual: 45,
      totalScore: 85,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
    },
  })

  await prisma.kpi.create({
    data: {
      userId: pharmaRep.id,
      period: 'monthly',
      revenueTarget: 120000000,
      revenueActual: 150000000,
      customerTarget: 25,
      customerActual: 28,
      orderTarget: 60,
      orderActual: 55,
      totalScore: 92,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-01-31'),
    },
  })

  // Create promotions
  await prisma.promotion.create({
    data: {
      code: 'KM001',
      name: 'Giảm 10% thuốc OTC',
      type: 'discount',
      value: 10,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      status: 'active',
    },
  })

  await prisma.promotion.create({
    data: {
      code: 'KM002',
      name: 'Combo Vitamin C + Khẩu trang',
      type: 'combo',
      value: 15,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30'),
      status: 'active',
    },
  })

  // Create tax settings
  await prisma.taxSetting.create({
    data: { name: 'VAT 5%', rate: 5, type: 'vat', status: 'active' },
  })

  await prisma.taxSetting.create({
    data: { name: 'VAT 8%', rate: 8, type: 'vat', status: 'active' },
  })

  await prisma.taxSetting.create({
    data: { name: 'VAT 10%', rate: 10, type: 'vat', status: 'active' },
  })

  // Create compliance records
  await prisma.complianceRecord.create({
    data: {
      type: 'license',
      title: 'Giấy phép kinh doanh dược',
      status: 'active',
      expiryDate: new Date('2025-12-31'),
    },
  })

  await prisma.complianceRecord.create({
    data: {
      type: 'audit',
      title: 'Kiểm tra định kỳ Q1/2024',
      status: 'active',
    },
  })

  // Create lookups (reference data)
  const lookupData: { category: string; value: string; label: string; color?: string; sortOrder: number }[] = [
    // Customer types
    { category: 'customer_type', value: 'pharmacy', label: 'Nhà thuốc', sortOrder: 1 },
    { category: 'customer_type', value: 'hospital', label: 'Bệnh viện', sortOrder: 2 },
    { category: 'customer_type', value: 'clinic', label: 'Phòng khám', sortOrder: 3 },
    { category: 'customer_type', value: 'distributor', label: 'Nhà phân phối', sortOrder: 4 },
    { category: 'customer_type', value: 'wholesaler', label: 'Đại lý sỉ', sortOrder: 5 },
    { category: 'customer_type', value: 'retailer', label: 'Bán lẻ', sortOrder: 6 },
    // Customer regions
    { category: 'customer_region', value: 'north', label: 'Miền Bắc', sortOrder: 1 },
    { category: 'customer_region', value: 'central', label: 'Miền Trung', sortOrder: 2 },
    { category: 'customer_region', value: 'south', label: 'Miền Nam', sortOrder: 3 },
    { category: 'customer_region', value: 'highlands', label: 'Tây Nguyên', sortOrder: 4 },
    // Customer statuses
    { category: 'customer_status', value: 'active', label: 'Hoạt động', sortOrder: 1 },
    { category: 'customer_status', value: 'inactive', label: 'Không hoạt động', sortOrder: 2 },
    { category: 'customer_status', value: 'potential', label: 'Tiềm năng', sortOrder: 3 },
    { category: 'customer_status', value: 'blocked', label: 'Bị chặn', sortOrder: 4 },
    // Product categories
    { category: 'product_category', value: 'prescription', label: 'Thuốc kê đơn', sortOrder: 1 },
    { category: 'product_category', value: 'otc', label: 'Thuốc OTC', sortOrder: 2 },
    { category: 'product_category', value: 'supplement', label: 'Thực phẩm chức năng', sortOrder: 3 },
    { category: 'product_category', value: 'medical-device', label: 'Trang thiết bị y tế', sortOrder: 4 },
    { category: 'product_category', value: 'consumable', label: 'Vật tư tiêu hao', sortOrder: 5 },
    // Product statuses
    { category: 'product_status', value: 'active', label: 'Hoạt động', sortOrder: 1 },
    { category: 'product_status', value: 'inactive', label: 'Ngừng kinh doanh', sortOrder: 2 },
    { category: 'product_status', value: 'discontinued', label: 'Ngừng sản xuất', sortOrder: 3 },
    // Inventory statuses + colors
    { category: 'inventory_status', value: 'in-stock', label: 'Còn hàng', color: 'bg-green-100 text-green-800', sortOrder: 1 },
    { category: 'inventory_status', value: 'low-stock', label: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800', sortOrder: 2 },
    { category: 'inventory_status', value: 'expiring', label: 'Sắp hết hạn', color: 'bg-orange-100 text-orange-800', sortOrder: 3 },
    { category: 'inventory_status', value: 'expired', label: 'Hết hạn', color: 'bg-red-100 text-red-800', sortOrder: 4 },
    { category: 'inventory_status', value: 'out-of-stock', label: 'Hết hàng', color: 'bg-gray-100 text-gray-800', sortOrder: 5 },
    // Warehouses
    { category: 'warehouse', value: 'main', label: 'Kho chính', sortOrder: 1 },
    { category: 'warehouse', value: 'cold', label: 'Kho lạnh', sortOrder: 2 },
    { category: 'warehouse', value: 'quarantine', label: 'Kho cách ly', sortOrder: 3 },
    { category: 'warehouse', value: 'return', label: 'Kho hàng trả', sortOrder: 4 },
    // Sales order statuses + colors
    { category: 'order_status', value: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', sortOrder: 1 },
    { category: 'order_status', value: 'confirmed', label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', sortOrder: 2 },
    { category: 'order_status', value: 'processing', label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-800', sortOrder: 3 },
    { category: 'order_status', value: 'shipped', label: 'Đã giao', color: 'bg-purple-100 text-purple-800', sortOrder: 4 },
    { category: 'order_status', value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800', sortOrder: 5 },
    { category: 'order_status', value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800', sortOrder: 6 },
    // Purchase order statuses + colors
    { category: 'po_status', value: 'draft', label: 'Nháp', color: 'bg-gray-100 text-gray-800', sortOrder: 1 },
    { category: 'po_status', value: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', sortOrder: 2 },
    { category: 'po_status', value: 'approved', label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', sortOrder: 3 },
    { category: 'po_status', value: 'ordered', label: 'Đã đặt', color: 'bg-indigo-100 text-indigo-800', sortOrder: 4 },
    { category: 'po_status', value: 'delivered', label: 'Đã giao', color: 'bg-purple-100 text-purple-800', sortOrder: 5 },
    { category: 'po_status', value: 'completed', label: 'Hoàn thành', color: 'bg-green-100 text-green-800', sortOrder: 6 },
    { category: 'po_status', value: 'cancelled', label: 'Đã hủy', color: 'bg-red-100 text-red-800', sortOrder: 7 },
    // Priorities + colors
    { category: 'priority', value: 'low', label: 'Thấp', color: 'bg-gray-100 text-gray-800', sortOrder: 1 },
    { category: 'priority', value: 'normal', label: 'Bình thường', color: 'bg-blue-100 text-blue-800', sortOrder: 2 },
    { category: 'priority', value: 'high', label: 'Cao', color: 'bg-orange-100 text-orange-800', sortOrder: 3 },
    { category: 'priority', value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-100 text-red-800', sortOrder: 4 },
    // Distributor types
    { category: 'distributor_type', value: 'exclusive', label: 'Đại lý độc quyền', sortOrder: 1 },
    { category: 'distributor_type', value: 'non-exclusive', label: 'Không độc quyền', sortOrder: 2 },
    { category: 'distributor_type', value: 'general', label: 'Đại lý tổng hợp', sortOrder: 3 },
    { category: 'distributor_type', value: 'sub', label: 'Đại lý cấp 2', sortOrder: 4 },
    { category: 'distributor_type', value: 'retail', label: 'Cửa hàng bán lẻ', sortOrder: 5 },
    // Distributor statuses
    { category: 'distributor_status', value: 'active', label: 'Hoạt động', sortOrder: 1 },
    { category: 'distributor_status', value: 'inactive', label: 'Ngừng hợp tác', sortOrder: 2 },
    { category: 'distributor_status', value: 'suspended', label: 'Tạm ngưng', sortOrder: 3 },
    // Employee statuses
    { category: 'employee_status', value: 'active', label: 'Đang làm việc', sortOrder: 1 },
    { category: 'employee_status', value: 'inactive', label: 'Đã nghỉ', sortOrder: 2 },
    { category: 'employee_status', value: 'probation', label: 'Thử việc', sortOrder: 3 },
    // Employee roles
    { category: 'employee_role', value: 'sales', label: 'Kinh doanh', sortOrder: 1 },
    { category: 'employee_role', value: 'pharmacy-rep', label: 'Dược sĩ', sortOrder: 2 },
    // Promotion types
    { category: 'promotion_type', value: 'discount', label: 'Giảm giá', sortOrder: 1 },
    { category: 'promotion_type', value: 'combo', label: 'Combo', sortOrder: 2 },
    { category: 'promotion_type', value: 'campaign', label: 'Chiến dịch', sortOrder: 3 },
    { category: 'promotion_type', value: 'buy_x_get_y', label: 'Mua X tặng Y', sortOrder: 4 },
    { category: 'promotion_type', value: 'free_ship', label: 'Miễn phí vận chuyển', sortOrder: 5 },
    { category: 'promotion_type', value: 'voucher', label: 'Voucher', sortOrder: 6 },
    { category: 'promotion_type', value: 'seasonal', label: 'Theo mùa', sortOrder: 7 },
    // Promotion statuses
    { category: 'promotion_status', value: 'active', label: 'Đang áp dụng', sortOrder: 1 },
    { category: 'promotion_status', value: 'scheduled', label: 'Sắp diễn ra', sortOrder: 2 },
    { category: 'promotion_status', value: 'expired', label: 'Đã kết thúc', sortOrder: 3 },
    { category: 'promotion_status', value: 'cancelled', label: 'Đã hủy', sortOrder: 4 },
    // Price types
    { category: 'price_type', value: 'wholesale', label: 'Giá bán sỉ', sortOrder: 1 },
    { category: 'price_type', value: 'retail', label: 'Giá bán lẻ', sortOrder: 2 },
    { category: 'price_type', value: 'special', label: 'Giá đặc biệt', sortOrder: 3 },
    { category: 'price_type', value: 'contract', label: 'Giá hợp đồng', sortOrder: 4 },
    // Price statuses
    { category: 'price_status', value: 'active', label: 'Đang áp dụng', sortOrder: 1 },
    { category: 'price_status', value: 'pending', label: 'Chờ áp dụng', sortOrder: 2 },
    { category: 'price_status', value: 'expired', label: 'Hết hiệu lực', sortOrder: 3 },
    // Compliance types
    { category: 'compliance_type', value: 'license', label: 'Giấy phép kinh doanh', sortOrder: 1 },
    { category: 'compliance_type', value: 'audit', label: 'Kiểm tra', sortOrder: 2 },
    { category: 'compliance_type', value: 'regulatory-report', label: 'Báo cáo', sortOrder: 3 },
    { category: 'compliance_type', value: 'certificate', label: 'Chứng chỉ hành nghề', sortOrder: 4 },
    { category: 'compliance_type', value: 'inspection', label: 'Kiểm tra chất lượng', sortOrder: 5 },
    { category: 'compliance_type', value: 'gpp', label: 'Chứng nhận GPP', sortOrder: 6 },
    { category: 'compliance_type', value: 'gdp', label: 'Chứng nhận GDP', sortOrder: 7 },
    { category: 'compliance_type', value: 'other', label: 'Khác', sortOrder: 8 },
    // Compliance statuses + colors
    { category: 'compliance_status', value: 'valid', label: 'Còn hiệu lực', color: 'bg-green-100 text-green-800', sortOrder: 1 },
    { category: 'compliance_status', value: 'expiring', label: 'Sắp hết hạn', color: 'bg-yellow-100 text-yellow-800', sortOrder: 2 },
    { category: 'compliance_status', value: 'expired', label: 'Hết hạn', color: 'bg-red-100 text-red-800', sortOrder: 3 },
    { category: 'compliance_status', value: 'pending', label: 'Chờ cấp', color: 'bg-gray-100 text-gray-800', sortOrder: 4 },
    { category: 'compliance_status', value: 'revoked', label: 'Đã thu hồi', color: 'bg-red-100 text-red-800', sortOrder: 5 },
    // Tax types
    { category: 'tax_type', value: 'vat', label: 'VAT', sortOrder: 1 },
    { category: 'tax_type', value: 'special', label: 'Thuế tiêu thụ đặc biệt', sortOrder: 2 },
    { category: 'tax_type', value: 'import', label: 'Thuế nhập khẩu', sortOrder: 3 },
    // Tax statuses
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

  // Seed settings defaults
  const defaultSettings = [
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

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    })
  }

  // Seed navigation items
  const navItemData = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊', permission: 'dashboard:read', sortOrder: 1 },
    { href: '/customers', label: 'Quản Lý Khách Hàng', icon: '👥', permission: 'customers:read', sortOrder: 2 },
    { href: '/products', label: 'Danh Mục Thuốc', icon: '💊', permission: 'products:read', sortOrder: 3 },
    { href: '/inventory', label: 'Quản Lý Kho', icon: '🏭', permission: 'inventory:read', sortOrder: 4 },
    { href: '/sales-orders', label: 'Đơn Hàng Bán', icon: '🛒', permission: 'sales-orders:read', sortOrder: 5 },
    { href: '/purchase-orders', label: 'Đơn Hàng Mua', icon: '📄', permission: 'purchase-orders:read', sortOrder: 6 },
    { href: '/distribution', label: 'Phân Phối - Đại Lý', icon: '🚚', permission: 'distribution:read', sortOrder: 7 },
    { href: '/sales-team', label: 'Đội Ngũ Sales', icon: '👔', permission: 'sales-team:read', sortOrder: 8 },
    { href: '/promotions', label: 'Chương Trình KM', icon: '🏷️', permission: 'promotions:read', sortOrder: 9 },
    { href: '/pricing', label: 'Quản Lý Giá', icon: '💰', permission: 'pricing:read', sortOrder: 10 },
    { href: '/compliance', label: 'Tuân Thủ Quy Định', icon: '🛡️', permission: 'compliance:read', sortOrder: 11 },
    { href: '/reports', label: 'Báo Cáo & Phân Tích', icon: '📈', permission: 'reports:read', sortOrder: 12 },
    { href: '/tax', label: 'Quản Lý Thuế', icon: '🧮', permission: 'tax:read', sortOrder: 13 },
    { href: '/settings', label: 'Cài Đặt Hệ Thống', icon: '⚙️', permission: 'settings:read', sortOrder: 14 },
  ]
  for (const nav of navItemData) {
    await prisma.navigationItem.upsert({
      where: { href: nav.href },
      update: { label: nav.label, icon: nav.icon, permission: nav.permission, sortOrder: nav.sortOrder, isActive: true },
      create: nav,
    })
  }

  // Seed role permissions (derived from hardcoded matrix)
  const rolePermissionData: { permission: string; role: string }[] = [
    // admin can do everything — stored as individual rows for queryability
    { permission: '*', role: 'admin' },
    // dashboard
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care', 'ceo', 'marketing-manager'].map(r => ({ permission: 'dashboard:read', role: r })),
    // customers
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'distribution', 'customer-care', 'ceo', 'marketing-manager'].map(r => ({ permission: 'customers:read', role: r })),
    ...['admin', 'sales', 'pharmacy-rep'].map(r => ({ permission: 'customers:write', role: r })),
    ...['admin'].map(r => ({ permission: 'customers:delete', role: r })),
    // products
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'accountant', 'ceo', 'marketing-manager'].map(r => ({ permission: 'products:read', role: r })),
    ...['admin', 'warehouse'].map(r => ({ permission: 'products:write', role: r })),
    ...['admin'].map(r => ({ permission: 'products:delete', role: r })),
    // inventory
    ...['admin', 'warehouse', 'sales', 'pharmacy-rep', 'ceo'].map(r => ({ permission: 'inventory:read', role: r })),
    ...['admin', 'warehouse'].map(r => ({ permission: 'inventory:write', role: r })),
    // sales-orders
    ...['admin', 'sales', 'pharmacy-rep', 'accountant', 'ceo', 'marketing-manager'].map(r => ({ permission: 'sales-orders:read', role: r })),
    ...['admin', 'sales', 'pharmacy-rep'].map(r => ({ permission: 'sales-orders:write', role: r })),
    ...['admin'].map(r => ({ permission: 'sales-orders:delete', role: r })),
    // purchase-orders
    ...['admin', 'warehouse', 'accountant', 'ceo'].map(r => ({ permission: 'purchase-orders:read', role: r })),
    ...['admin', 'warehouse'].map(r => ({ permission: 'purchase-orders:write', role: r })),
    ...['admin'].map(r => ({ permission: 'purchase-orders:delete', role: r })),
    // distribution
    ...['admin', 'distribution', 'sales', 'ceo', 'marketing-manager'].map(r => ({ permission: 'distribution:read', role: r })),
    ...['admin', 'distribution', 'marketing-manager'].map(r => ({ permission: 'distribution:write', role: r })),
    // sales-team
    ...['admin', 'sales', 'distribution', 'ceo'].map(r => ({ permission: 'sales-team:read', role: r })),
    ...['admin', 'sales'].map(r => ({ permission: 'sales-team:write', role: r })),
    // kpi
    ...['admin', 'sales', 'pharmacy-rep', 'ceo'].map(r => ({ permission: 'kpi:read', role: r })),
    ...['admin', 'sales'].map(r => ({ permission: 'kpi:write', role: r })),
    // promotions
    ...['admin', 'distribution', 'sales', 'ceo', 'marketing-manager'].map(r => ({ permission: 'promotions:read', role: r })),
    ...['admin', 'distribution', 'marketing-manager'].map(r => ({ permission: 'promotions:write', role: r })),
    // pricing
    ...['admin', 'sales', 'warehouse', 'accountant', 'ceo', 'marketing-manager'].map(r => ({ permission: 'pricing:read', role: r })),
    ...['admin', 'marketing-manager'].map(r => ({ permission: 'pricing:write', role: r })),
    // compliance
    ...['admin', 'warehouse', 'ceo'].map(r => ({ permission: 'compliance:read', role: r })),
    ...['admin'].map(r => ({ permission: 'compliance:write', role: r })),
    // reports
    ...['admin', 'sales', 'warehouse', 'accountant', 'distribution', 'ceo', 'marketing-manager'].map(r => ({ permission: 'reports:read', role: r })),
    // tax
    ...['admin', 'accountant', 'ceo'].map(r => ({ permission: 'tax:read', role: r })),
    ...['admin', 'accountant'].map(r => ({ permission: 'tax:write', role: r })),
    // settings
    ...['admin', 'ceo'].map(r => ({ permission: 'settings:read', role: r })),
    ...['admin'].map(r => ({ permission: 'settings:write', role: r })),
    // users
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

  console.log('Seed data created successfully')
  console.log(` - ${customers.length} customers`)
  console.log(` - ${products.length} products`)
  console.log(` - ${[order1, order2].length} sales orders`)
  console.log(' - 2 purchase orders')
  console.log(' - 3 distributors')
  console.log(' - 3 territories')
  console.log(' - 2 KPI records')
  console.log(' - 3 promotions')
  console.log(' - 3 tax settings')
  console.log(' - 2 compliance records')
  console.log(' - 8 users (admin, warehouse, sales, pharmacy-rep, accountant, ceo, marketing, distribution, customer-care)')
  console.log(` - ${lookupData.length} lookup values`)
  console.log(` - ${defaultSettings.length} settings`)
  console.log(` - ${rolePermissionData.length} role permissions`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
