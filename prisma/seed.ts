import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  // Create admin user
  await prisma.user.create({
    data: {
      code: 'ADMIN001',
      name: 'Quản Trị Hệ Thống',
      email: 'admin@pharmacrm.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    },
  })

  const warehouseManager = await prisma.user.create({
    data: {
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

  const salesManager = await prisma.user.create({
    data: {
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

  const pharmaRep = await prisma.user.create({
    data: {
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

  await prisma.promotion.create({
    data: {
      code: 'KM003',
      name: 'Chiến dịch sức khỏe mùa xuân',
      type: 'campaign',
      value: 20,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      status: 'active',
    },
  })

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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
