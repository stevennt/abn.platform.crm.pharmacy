// ABN PharmaCRM - Pharmaceutical Trading CRM System JavaScript

// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');

// Navigation functionality
function initNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get target section
            const targetId = link.getAttribute('href').substring(1);
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            link.parentElement.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Initialize specific modules when their sections are shown
                initializeModule(targetId);
            }
        });
    });
}

// Initialize specific modules based on section ID
function initializeModule(moduleId) {
    switch(moduleId) {
        case 'dashboard':
            initDashboard();
            break;
        case 'customer-management':
            initCustomerManagement();
            break;
        case 'product-catalog':
            initProductCatalog();
            break;
        case 'inventory-management':
            initInventoryManagement();
            break;
        case 'sales-orders':
            initSalesOrderManagement();
            break;
        case 'purchase-orders':
            initPurchaseOrderManagement();
            break;
        case 'distribution':
            initDistributionManagement();
            break;
        case 'sales-team':
            initSalesTeam();
            break;
        case 'promotions':
            initPromotionsManagement();
            break;
        case 'pricing':
            initPricingManagement();
            break;
        case 'compliance':
            initComplianceManagement();
            break;
        case 'reports':
            initReportsManagement();
            break;
        case 'settings':
            initSettingsManagement();
            break;
        case 'tax-management':
            initTaxManagement();
            break;
        default:
            console.log('Module initialized:', moduleId);
    }
}

// Sample data for pharmaceutical trading CRM
const sampleCustomers = [
    { 
        id: 'KH001', 
        name: 'Nhà Thuốc An Khang', 
        type: 'pharmacy',
        taxCode: '0123456789',
        phone: '0901234567', 
        email: 'contact@ankhang.com', 
        address: '123 Đường ABC, Quận 1, TP.HCM',
        region: 'south',
        creditLimit: 500000000,
        status: 'active',
        createdDate: '2024-01-15',
        lastOrder: '2024-01-20',
        notes: 'Khách hàng VIP'
    },
    { 
        id: 'KH002', 
        name: 'Bệnh Viện Đa Khoa Bình Minh', 
        type: 'hospital',
        taxCode: '0987654321',
        phone: '0907654321', 
        email: 'mua@bvbinhminh.com', 
        address: '456 Đường XYZ, Quận 3, TP.HCM',
        region: 'south',
        creditLimit: 1000000000,
        status: 'active',
        createdDate: '2024-01-10',
        lastOrder: '2024-01-18',
        notes: 'Khách hàng lớn'
    }
];

// Sample products data for pharmaceutical CRM
const sampleProducts = [
    {
        id: 'SP001',
        name: 'Paracetamol 500mg',
        activeIngredient: 'Paracetamol',
        category: 'otc',
        manufacturer: 'Công ty Dược phẩm ABC',
        unit: 'Viên',
        purchasePrice: 150,
        salePrice: 200,
        stock: 5000,
        minStock: 500,
        batchNumber: 'LOT001-2024',
        expiryDate: '2026-12-31',
        status: 'active'
    }
];

// Use sample products in product catalog initialization
function getProductCatalogData() {
    return sampleProducts;
}

const sampleSalesOrders = [
    {
        id: 'DH001',
        customerId: 'KH001',
        customerName: 'Nhà Thuốc An Khang',
        salesPersonId: 'NV001',
        salesPersonName: 'Nguyễn Văn Sales',
        orderDate: '2024-01-20',
        deliveryDate: '2024-01-22',
        totalAmount: 15000000,
        status: 'confirmed',
        notes: 'Đơn hàng thường xuyên',
        createdDate: '2024-01-15',
        items: [
            {
                productId: 'SP001',
                productName: 'Paracetamol 500mg',
                quantity: 1000,
                unitPrice: 200,
                totalPrice: 200000
            }
        ]
    }
];

// Customer Management
let currentCustomers = [...sampleCustomers];
let currentPage = 1;
const customersPerPage = 10;

// Initialize Customer Management
function initCustomerManagement() {
    updateCustomerStats();
    renderCustomersTable();
    setupCustomerEventListeners();
}

// Update customer statistics
function updateCustomerStats() {
    const totalCustomers = currentCustomers.length;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newCustomersThisMonth = currentCustomers.filter(customer => {
        const createdDate = new Date(customer.createdDate);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;
    
    const activeCustomers = currentCustomers.filter(customer => customer.status === 'active').length;
    const potentialCustomers = currentCustomers.filter(customer => customer.status === 'potential').length;
    
    const totalCustomersEl = document.getElementById('total-customers');
    const newCustomersEl = document.getElementById('new-customers-month');
    const activeCustomersEl = document.getElementById('active-customers');
    const potentialCustomersEl = document.getElementById('potential-customers');
    
    if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
    if (newCustomersEl) newCustomersEl.textContent = newCustomersThisMonth;
    if (activeCustomersEl) activeCustomersEl.textContent = activeCustomers;
    if (potentialCustomersEl) potentialCustomersEl.textContent = potentialCustomers;
}

// Render customers table
function renderCustomersTable() {
    const tableBody = document.getElementById('customers-table-body');
    if (!tableBody) return;
    
    const startIndex = (currentPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    const customersToShow = currentCustomers.slice(startIndex, endIndex);
    
    tableBody.innerHTML = '';
    
    customersToShow.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${getCustomerTypeLabel(customer.type)}</td>
            <td>${customer.taxCode}</td>
            <td>${customer.phone}</td>
            <td>${customer.email}</td>
            <td>${getRegionLabel(customer.region)}</td>
            <td>${formatCurrency(customer.creditLimit)}</td>
            <td><span class="status-badge status-${customer.status}">${getStatusLabel(customer.status)}</span></td>
            <td>${formatDate(customer.createdDate)}</td>
            <td>
                <button class="action-btn view" onclick="viewCustomer('${customer.id}')">Xem</button>
                <button class="action-btn edit" onclick="editCustomer('${customer.id}')">Sửa</button>
                <button class="action-btn delete" onclick="deleteCustomer('${customer.id}')">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(currentCustomers.length / customersPerPage);
    const paginationContainer = document.getElementById('customers-pagination');
    if (!paginationContainer) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">‹ Trước</button>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    paginationHTML += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Sau ›</button>`;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(currentCustomers.length / customersPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderCustomersTable();
    }
}

// Search customers
function searchCustomers() {
    const searchInput = document.getElementById('customer-search');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm === '') {
        currentCustomers = [...sampleCustomers];
    } else {
        currentCustomers = sampleCustomers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm) ||
            customer.id.toLowerCase().includes(searchTerm) ||
            customer.email.toLowerCase().includes(searchTerm) ||
            customer.taxCode.includes(searchTerm)
        );
    }
    
    currentPage = 1;
    filterCustomers();
}

// Filter customers
function filterCustomers() {
    const typeFilter = document.getElementById('customer-type-filter');
    const statusFilter = document.getElementById('customer-status-filter');
    const regionFilter = document.getElementById('region-filter');
    const dateFrom = document.getElementById('date-from');
    const dateTo = document.getElementById('date-to');
    
    if (!typeFilter || !statusFilter || !regionFilter || !dateFrom || !dateTo) return;
    
    let filteredCustomers = [...currentCustomers];
    
    if (typeFilter.value) {
        filteredCustomers = filteredCustomers.filter(customer => customer.type === typeFilter.value);
    }
    
    if (statusFilter.value) {
        filteredCustomers = filteredCustomers.filter(customer => customer.status === statusFilter.value);
    }
    
    if (regionFilter.value) {
        filteredCustomers = filteredCustomers.filter(customer => customer.region === regionFilter.value);
    }
    
    if (dateFrom.value) {
        filteredCustomers = filteredCustomers.filter(customer => customer.createdDate >= dateFrom.value);
    }
    
    if (dateTo.value) {
        filteredCustomers = filteredCustomers.filter(customer => customer.createdDate <= dateTo.value);
    }
    
    currentCustomers = filteredCustomers;
    currentPage = 1;
    renderCustomersTable();
    updateCustomerStats();
}

// Helper functions for customer management
function getCustomerTypeLabel(type) {
    const labels = {
        'pharmacy': 'Nhà thuốc',
        'hospital': 'Bệnh viện',
        'clinic': 'Phòng khám',
        'distributor': 'Nhà phân phối',
        'wholesaler': 'Đại lý bán buôn',
        'retailer': 'Bán lẻ'
    };
    return labels[type] || type;
}

function getRegionLabel(region) {
    const labels = {
        'north': 'Miền Bắc',
        'central': 'Miền Trung',
        'south': 'Miền Nam'
    };
    return labels[region] || region;
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Đang hoạt động',
        'completed': 'Hoàn thành',
        'inactive': 'Không hoạt động',
        'potential': 'Tiềm năng',
        'blacklist': 'Danh sách đen'
    };
    return labels[status] || status;
}

// Customer actions
function viewCustomer(customerId) {
    console.log('View customer:', customerId);
}

function editCustomer(customerId) {
    console.log('Edit customer:', customerId);
}

function deleteCustomer(customerId) {
    console.log('Delete customer:', customerId);
}

function setupCustomerEventListeners() {
    const searchInput = document.getElementById('customer-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchCustomers, 300));
    }
}

// Dashboard functions for pharmaceutical CRM
function updateDashboardStats() {
    console.log('Dashboard stats updated for pharmaceutical CRM');
}

function loadRecentActivities() {
    const activitiesContainer = document.getElementById('recent-activities');
    if (!activitiesContainer) return;
    
    const activities = [
        { time: '10:30', action: 'Nhà thuốc An Khang đã đặt đơn hàng mới', type: 'order' },
        { time: '09:15', action: 'Hoàn thành giao hàng cho Bệnh viện Đa khoa', type: 'delivery' },
        { time: '08:45', action: 'Thêm khách hàng mới: Phòng khám ABC', type: 'customer' }
    ];
    
    activitiesContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <span class="activity-time">${activity.time}</span>
            <span class="activity-text">${activity.action}</span>
        </div>
    `).join('');
}

// Initialize dashboard
function initDashboard() {
    updateDashboardStats();
    loadRecentActivities();
}

// Sales Order Management Module
let currentOrderView = 'list';
let filteredOrders = [...sampleSalesOrders];

function getCurrentOrderView() {
    return currentOrderView;
}

function getFilteredOrders() {
    return filteredOrders;
}

// Initialize sales order management
function initSalesOrderManagement() {
    updateOrderStats();
    renderOrderListView();
    setupOrderEventListeners();
}

// Update order statistics
function updateOrderStats() {
    const today = getCurrentDate();
    const todayOrders = sampleSalesOrders.filter(order => order.orderDate === today);
    const pendingOrders = sampleSalesOrders.filter(order => order.status === 'pending').length;
    const processingOrders = sampleSalesOrders.filter(order => order.status === 'processing').length;
    
    const todayOrdersEl = document.getElementById('today-orders');
    const pendingOrdersEl = document.getElementById('pending-orders');
    const processingOrdersEl = document.getElementById('processing-orders');
    const todayRevenueEl = document.getElementById('today-revenue');
    
    if (todayOrdersEl) todayOrdersEl.textContent = todayOrders.length;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (processingOrdersEl) processingOrdersEl.textContent = processingOrders;
    if (todayRevenueEl) todayRevenueEl.textContent = '2.4M';
}

// Switch between order views
function switchOrderView(view) {
    currentOrderView = view;
    
    // Update active button
    document.querySelectorAll('.view-toggle .toggle-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[onclick="switchOrderView('${view}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Show selected view
    switch(view) {
        case 'list':
            renderOrderListView();
            break;
        case 'kanban':
            renderOrderKanbanView();
            break;
        case 'analytics':
            renderOrderAnalyticsView();
            break;
    }
}

// Render order list view
function renderOrderListView() {
    console.log('Rendering order list view');
}

// Render order kanban view
function renderOrderKanbanView() {
    console.log('Rendering order kanban view');
}

// Render order analytics view
function renderOrderAnalyticsView() {
    console.log('Rendering order analytics view');
}

// Filter orders by status
function filterByStatus(status) {
    if (status === 'all') {
        filteredOrders = [...sampleSalesOrders];
    } else {
        filteredOrders = sampleSalesOrders.filter(order => order.status === status);
    }
    renderOrderListView();
}

// Search orders
function searchOrders() {
    const searchInput = document.getElementById('order-search');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    filteredOrders = sampleSalesOrders.filter(order => 
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm) ||
        order.salesPersonName.toLowerCase().includes(searchTerm)
    );
    
    renderOrderListView();
}

// Setup order event listeners
function setupOrderEventListeners() {
    const searchInput = document.getElementById('order-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchOrders, 300));
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Initialize notifications system
function initNotifications() {
    showNotification('Pharmaceutical CRM system loaded successfully', 'success');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize CSV export functionality
function initCSVExport() {
    console.log('CSV export functionality initialized');
}

// Helper function to get current date
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Initialize the pharmaceutical CRM application
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initDashboard();
    initCustomerManagement();
    initProductCatalog();
    initInventoryManagement();
    initSalesOrderManagement();
    initDistributionManagement();
    initNotifications();
    initCSVExport();
    
    // Use sample data
    getProductCatalogData();
    getCurrentOrderView();
    getFilteredOrders();
});

// Pharmaceutical CRM specific functions
function initProductCatalog() {
    console.log('Product catalog initialized');
}

function initInventoryManagement() {
    console.log('Inventory management initialized');
}

function initDistributionManagement() {
    console.log('Distribution management initialized');
}

function initPurchaseOrderManagement() {
    console.log('Purchase order management initialized');
}

function initSalesTeam() {
    console.log('Sales team management initialized');
    loadEmployeeData();
    loadPerformanceData();
    loadTerritoryData();
    loadKPIData();
}

// Sales Team Tab Switching
function switchSalesTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('#sales-team .tab-content');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('#sales-team .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event.target;
    clickedButton.classList.add('active');
    
    // Load data for specific tab
    switch(tabName) {
        case 'team-list':
            loadEmployeeData();
            break;
        case 'performance':
            loadPerformanceData();
            break;
        case 'territories':
            loadTerritoryData();
            break;
        case 'kpi-tracking':
            loadKPIData();
            break;
    }
}

// Employee Management Functions
function showAddSalesPersonModal() {
    // Create modal for adding new sales person
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Thêm nhân viên mới</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <form id="add-employee-form">
                    <div class="form-group">
                        <label>Mã nhân viên:</label>
                        <input type="text" id="employee-id" required>
                    </div>
                    <div class="form-group">
                        <label>Họ tên:</label>
                        <input type="text" id="employee-name" required>
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="employee-email" required>
                    </div>
                    <div class="form-group">
                        <label>Số điện thoại:</label>
                        <input type="tel" id="employee-phone" required>
                    </div>
                    <div class="form-group">
                        <label>Chức vụ:</label>
                        <select id="employee-position" required>
                            <option value="">-- Chọn chức vụ --</option>
                            <option value="sales-rep">Nhân viên bán hàng</option>
                            <option value="pharmacy-rep">Trình dược viên</option>
                            <option value="sales-manager">Quản lý bán hàng</option>
                            <option value="territory-manager">Quản lý vùng</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Phòng ban:</label>
                        <select id="employee-department" required>
                            <option value="">-- Chọn phòng ban --</option>
                            <option value="sales">Bán hàng</option>
                            <option value="pharmacy">Trình dược viên</option>
                            <option value="marketing">Marketing</option>
                            <option value="support">Hỗ trợ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ngày bắt đầu:</label>
                        <input type="date" id="employee-start-date" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this)">Hủy</button>
                <button class="btn btn-primary" onclick="addEmployee()">Thêm nhân viên</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function addEmployee() {
    const form = document.getElementById('add-employee-form');
    
    // Validate form
    if (!form.checkValidity()) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    // Get form values
    const employeeData = {
        id: document.getElementById('employee-id').value,
        name: document.getElementById('employee-name').value,
        email: document.getElementById('employee-email').value,
        phone: document.getElementById('employee-phone').value,
        position: document.getElementById('employee-position').value,
        department: document.getElementById('employee-department').value,
        startDate: document.getElementById('employee-start-date').value,
        status: 'active'
    };
    
    // Add to employees list (in real app, this would be an API call)
    console.log('Adding employee:', employeeData);
    
    // Close modal and refresh data
    closeModal(document.querySelector('.modal'));
    loadEmployeeData();
    
    alert('Đã thêm nhân viên thành công!');
}

function loadEmployeeData() {
    // Sample employee data
    const employees = [
        {
            id: 'NV001',
            name: 'Nguyễn Văn An',
            position: 'Nhân viên bán hàng',
            department: 'Bán hàng',
            territory: 'Hà Nội',
            kpi: '85%',
            revenue: '120M',
            status: 'active'
        },
        {
            id: 'NV002',
            name: 'Trần Thị Bình',
            position: 'Trình dược viên',
            department: 'Trình dược viên',
            territory: 'TP.HCM',
            kpi: '92%',
            revenue: '150M',
            status: 'active'
        },
        {
            id: 'NV003',
            name: 'Lê Văn Cường',
            position: 'Quản lý vùng',
            department: 'Bán hàng',
            territory: 'Miền Bắc',
            kpi: '78%',
            revenue: '200M',
            status: 'active'
        }
    ];
    
    const tbody = document.getElementById('employees-tbody');
    if (tbody) {
        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.position}</td>
                <td>${emp.department}</td>
                <td>${emp.territory}</td>
                <td><span class="badge ${emp.kpi >= '80%' ? 'badge-success' : 'badge-warning'}">${emp.kpi}</span></td>
                <td>${emp.revenue}</td>
                <td><span class="badge badge-${emp.status === 'active' ? 'success' : 'secondary'}">${emp.status === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editEmployee('${emp.id}')">Sửa</button>
                    <button class="btn btn-sm btn-secondary" onclick="viewEmployeeDetails('${emp.id}')">Chi tiết</button>
                </td>
            </tr>
        `).join('');
    }
}

function loadPerformanceData() {
    // Update performance stats
    document.getElementById('top-performer-name').textContent = 'Trần Thị Bình';
    document.getElementById('top-performer-value').textContent = '150M VNĐ';
    document.getElementById('avg-revenue').textContent = '123M VNĐ';
    document.getElementById('kpi-achievement-rate').textContent = '78%';
    
    // Load performance ranking
    const rankingData = [
        { name: 'Trần Thị Bình', revenue: '150M', kpi: '92%', rank: 1 },
        { name: 'Lê Văn Cường', revenue: '200M', kpi: '78%', rank: 2 },
        { name: 'Nguyễn Văn An', revenue: '120M', kpi: '85%', rank: 3 }
    ];
    
    const rankingList = document.getElementById('performance-ranking-list');
    if (rankingList) {
        rankingList.innerHTML = rankingData.map(item => `
            <div class="ranking-item">
                <span class="rank">#${item.rank}</span>
                <span class="name">${item.name}</span>
                <span class="value">${item.revenue}</span>
                <span class="kpi">${item.kpi}</span>
            </div>
        `).join('');
    }
}

function loadTerritoryData() {
    // Sample territory data
    const territories = [
        {
            name: 'Hà Nội',
            manager: 'Nguyễn Văn An',
            customers: 45,
            revenue: '2.5B',
            potential: 'Cao'
        },
        {
            name: 'TP.HCM',
            manager: 'Trần Thị Bình',
            customers: 62,
            revenue: '3.8B',
            potential: 'Rất cao'
        },
        {
            name: 'Đà Nẵng',
            manager: 'Lê Văn Cường',
            customers: 28,
            revenue: '1.2B',
            potential: 'Trung bình'
        }
    ];
    
    const tbody = document.getElementById('territory-assignments-tbody');
    if (tbody) {
        tbody.innerHTML = territories.map(territory => `
            <tr>
                <td>${territory.name}</td>
                <td>${territory.manager}</td>
                <td>${territory.customers}</td>
                <td>${territory.revenue}</td>
                <td><span class="badge ${territory.potential === 'Rất cao' ? 'badge-success' : territory.potential === 'Cao' ? 'badge-primary' : 'badge-warning'}">${territory.potential}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editTerritory('${territory.name}')">Sửa</button>
                    <button class="btn btn-sm btn-secondary" onclick="viewTerritoryDetails('${territory.name}')">Chi tiết</button>
                </td>
            </tr>
        `).join('');
    }
    
    // Load territories list
    const territoriesList = document.getElementById('territories-list-container');
    if (territoriesList) {
        territoriesList.innerHTML = territories.map(territory => `
            <div class="territory-item">
                <h5>${territory.name}</h5>
                <p>Quản lý: ${territory.manager}</p>
                <p>Khách hàng: ${territory.customers}</p>
                <p>Doanh thu: ${territory.revenue}</p>
            </div>
        `).join('');
    }
}

function loadKPIData() {
    // Sample KPI data
    const kpiData = [
        {
            employee: 'Nguyễn Văn An',
            revenueKPI: '100M',
            revenueActual: '120M',
            revenueRate: '120%',
            customerKPI: '20',
            customerActual: '18',
            customerRate: '90%',
            totalScore: '105',
            rank: 2
        },
        {
            employee: 'Trần Thị Bình',
            revenueKPI: '120M',
            revenueActual: '150M',
            revenueRate: '125%',
            customerKPI: '25',
            customerActual: '28',
            customerRate: '112%',
            totalScore: '118',
            rank: 1
        },
        {
            employee: 'Lê Văn Cường',
            revenueKPI: '180M',
            revenueActual: '200M',
            revenueRate: '111%',
            customerKPI: '15',
            customerActual: '12',
            customerRate: '80%',
            totalScore: '95',
            rank: 3
        }
    ];
    
    const tbody = document.getElementById('kpi-details-tbody');
    if (tbody) {
        tbody.innerHTML = kpiData.map(item => `
            <tr>
                <td>${item.employee}</td>
                <td>${item.revenueKPI}</td>
                <td>${item.revenueActual}</td>
                <td><span class="badge ${parseFloat(item.revenueRate) >= 100 ? 'badge-success' : 'badge-warning'}">${item.revenueRate}</span></td>
                <td>${item.customerKPI}</td>
                <td>${item.customerActual}</td>
                <td><span class="badge ${parseFloat(item.customerRate) >= 100 ? 'badge-success' : 'badge-warning'}">${item.customerRate}</span></td>
                <td><strong>${item.totalScore}</strong></td>
                <td><span class="rank-badge rank-${item.rank}">#${item.rank}</span></td>
            </tr>
        `).join('');
    }
}

// Territory Management Functions
function showAssignTerritoryModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Phân công vùng</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <form id="assign-territory-form">
                    <div class="form-group">
                        <label>Nhân viên:</label>
                        <select id="assign-employee" required>
                            <option value="">-- Chọn nhân viên --</option>
                            <option value="NV001">Nguyễn Văn An</option>
                            <option value="NV002">Trần Thị Bình</option>
                            <option value="NV003">Lê Văn Cường</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Vùng:</label>
                        <select id="assign-territory" required>
                            <option value="">-- Chọn vùng --</option>
                            <option value="hanoi">Hà Nội</option>
                            <option value="hcm">TP.HCM</option>
                            <option value="danang">Đà Nẵng</option>
                            <option value="cantho">Cần Thơ</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ngày bắt đầu:</label>
                        <input type="date" id="assign-start-date" required>
                    </div>
                    <div class="form-group">
                        <label>Ghi chú:</label>
                        <textarea id="assign-notes" placeholder="Ghi chú về phân công..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this)">Hủy</button>
                <button class="btn btn-primary" onclick="assignTerritory()">Phân công</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function assignTerritory() {
    const employee = document.getElementById('assign-employee').value;
    const territory = document.getElementById('assign-territory').value;
    const startDate = document.getElementById('assign-start-date').value;
    const notes = document.getElementById('assign-notes').value;
    
    if (!employee || !territory || !startDate) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    console.log('Assigning territory:', { employee, territory, startDate, notes });
    
    closeModal(document.querySelector('.modal'));
    loadTerritoryData();
    
    alert('Đã phân công vùng thành công!');
}

// KPI Management Functions
function showKPISettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Thiết lập KPI</h3>
                <span class="close" onclick="closeModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <form id="kpi-settings-form">
                    <div class="form-group">
                        <label>Nhân viên:</label>
                        <select id="kpi-employee" required>
                            <option value="">-- Chọn nhân viên --</option>
                            <option value="NV001">Nguyễn Văn An</option>
                            <option value="NV002">Trần Thị Bình</option>
                            <option value="NV003">Lê Văn Cường</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kỳ KPI:</label>
                        <select id="kpi-period" required>
                            <option value="">-- Chọn kỳ --</option>
                            <option value="monthly">Hàng tháng</option>
                            <option value="quarterly">Hàng quý</option>
                            <option value="yearly">Hàng năm</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>KPI Doanh thu (VNĐ):</label>
                        <input type="number" id="kpi-revenue" placeholder="VD: 100000000" required>
                    </div>
                    <div class="form-group">
                        <label>KPI Khách hàng mới:</label>
                        <input type="number" id="kpi-customers" placeholder="VD: 20" required>
                    </div>
                    <div class="form-group">
                        <label>KPI Số đơn hàng:</label>
                        <input type="number" id="kpi-orders" placeholder="VD: 50" required>
                    </div>
                    <div class="form-group">
                        <label>Trọng số doanh thu (%):</label>
                        <input type="number" id="kpi-revenue-weight" value="60" min="0" max="100" required>
                    </div>
                    <div class="form-group">
                        <label>Trọng số khách hàng (%):</label>
                        <input type="number" id="kpi-customer-weight" value="25" min="0" max="100" required>
                    </div>
                    <div class="form-group">
                        <label>Trọng số đơn hàng (%):</label>
                        <input type="number" id="kpi-order-weight" value="15" min="0" max="100" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal(this)">Hủy</button>
                <button class="btn btn-primary" onclick="setKPI()">Thiết lập KPI</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function setKPI() {
    const employee = document.getElementById('kpi-employee').value;
    const period = document.getElementById('kpi-period').value;
    const revenue = document.getElementById('kpi-revenue').value;
    const customers = document.getElementById('kpi-customers').value;
    const orders = document.getElementById('kpi-orders').value;
    const revenueWeight = document.getElementById('kpi-revenue-weight').value;
    const customerWeight = document.getElementById('kpi-customer-weight').value;
    const orderWeight = document.getElementById('kpi-order-weight').value;
    
    // Validate weights sum to 100
    const totalWeight = parseInt(revenueWeight) + parseInt(customerWeight) + parseInt(orderWeight);
    if (totalWeight !== 100) {
        alert('Tổng trọng số phải bằng 100%');
        return;
    }
    
    if (!employee || !period || !revenue || !customers || !orders) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    const kpiData = {
        employee,
        period,
        revenue: parseInt(revenue),
        customers: parseInt(customers),
        orders: parseInt(orders),
        weights: {
            revenue: parseInt(revenueWeight),
            customer: parseInt(customerWeight),
            order: parseInt(orderWeight)
        }
    };
    
    console.log('Setting KPI:', kpiData);
    
    closeModal(document.querySelector('.modal'));
    loadKPIData();
    
    alert('Đã thiết lập KPI thành công!');
}

// Export Functions
function exportSalesData() {
    // In a real application, this would generate and download a report
    const reportData = {
        employees: 'Employee data...',
        performance: 'Performance data...',
        territories: 'Territory data...',
        kpi: 'KPI data...'
    };
    
    console.log('Exporting sales data:', reportData);
    alert('Đang xuất báo cáo... (Chức năng sẽ được triển khai)');
}

// Utility Functions
function editEmployee(employeeId) {
    console.log('Editing employee:', employeeId);
    alert('Chức năng sửa nhân viên sẽ được triển khai');
}

function viewEmployeeDetails(employeeId) {
    console.log('Viewing employee details:', employeeId);
    alert('Chức năng xem chi tiết nhân viên sẽ được triển khai');
}

function editTerritory(territoryName) {
    console.log('Editing territory:', territoryName);
    alert('Chức năng sửa vùng sẽ được triển khai');
}

function viewTerritoryDetails(territoryName) {
    console.log('Viewing territory details:', territoryName);
    alert('Chức năng xem chi tiết vùng sẽ được triển khai');
}

function showCreateTerritoryModal() {
    alert('Chức năng tạo vùng mới sẽ được triển khai');
}

// Export functions to global scope
window.initSalesTeam = initSalesTeam;
window.switchSalesTab = switchSalesTab;
window.showAddSalesPersonModal = showAddSalesPersonModal;
window.showAssignTerritoryModal = showAssignTerritoryModal;
window.showKPISettingsModal = showKPISettingsModal;
window.exportSalesData = exportSalesData;
window.addEmployee = addEmployee;
window.assignTerritory = assignTerritory;
window.setKPI = setKPI;
window.editEmployee = editEmployee;
window.viewEmployeeDetails = viewEmployeeDetails;
window.editTerritory = editTerritory;
window.viewTerritoryDetails = viewTerritoryDetails;
window.showCreateTerritoryModal = showCreateTerritoryModal;

function initPromotionsManagement() {
    console.log('Promotions management initialized');
}

function initPricingManagement() {
    console.log('Pricing management initialized');
}

function initComplianceManagement() {
    console.log('Compliance management initialized');
}

function initReportsManagement() {
    console.log('Reports management initialized');
}

function initSettingsManagement() {
    console.log('Settings management initialized');
}

// Placeholder functions for various CRM modules
function showAddCustomerModal() { console.log('Add customer modal'); }
function importCustomerData() { console.log('Import customer data'); }
function exportCustomerData() { console.log('Export customer data'); }
function syncCustomerData() { console.log('Sync customer data'); }
function showCreateOrderModal() { console.log('Create order modal'); }
function showQuickOrderModal() { console.log('Quick order modal'); }
function showOrderTemplates() { console.log('Order templates'); }
function exportOrderData() { console.log('Export order data'); }
function showCreatePurchaseOrderModal() { console.log('Create purchase order modal'); }
function showSupplierCatalog() { console.log('Supplier catalog'); }
function showPurchaseTemplates() { console.log('Purchase templates'); }
function exportPurchaseData() { console.log('Export purchase data'); }
function showAddDistributorModal() { console.log('Add distributor modal'); }
function showTerritoryMap() { console.log('Territory map'); }
function showPerformanceReport() { console.log('Performance report'); }
function exportDistributionData() { console.log('Export distribution data'); }
function showCreatePromotionModal() { console.log('Create promotion modal'); }
function showVolumeDiscountModal() { console.log('Volume discount modal'); }
function showSeasonalPromotionModal() { console.log('Seasonal promotion modal'); }
function exportPromotionReport() { console.log('Export promotion report'); }
function showCreatePriceListModal() { console.log('Create price list modal'); }
function showBulkPriceUpdateModal() { console.log('Bulk price update modal'); }
function showCustomerPricingModal() { console.log('Customer pricing modal'); }
function exportPricingReport() { console.log('Export pricing report'); }
function showRegulatoryReportModal() { console.log('Regulatory report modal'); }
function showLicenseManagementModal() { console.log('License management modal'); }
function showAuditTrailModal() { console.log('Audit trail modal'); }
function exportComplianceReport() { console.log('Export compliance report'); }
function switchComplianceTab(tab) { console.log('Switch compliance tab:', tab); }
function switchSettingsTab(tab) { console.log('Switch settings tab:', tab); }
function showReportCategory(category) { console.log('Show report category:', category); }
function switchDistributionTab(tab) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('#distribution .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.distribution-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(tab + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Add active class to clicked button
    const clickedButton = event.target;
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Load data for the selected tab
    switch(tab) {
        case 'distributors':
            loadDistributorsData();
            break;
        case 'territories':
            loadTerritoriesData();
            break;
        case 'performance':
            loadPerformanceData();
            break;
        case 'commissions':
            loadCommissionsData();
            break;
    }
}

// Data loading functions for distribution tabs
function loadDistributorsData() {
    // Sample distributor data
    const distributors = [
        {
            id: 'DL001',
            name: 'Công ty TNHH Dược phẩm Miền Bắc',
            type: 'Độc quyền',
            region: 'Miền Bắc',
            revenue: '45M',
            commission: '3.6M',
            status: 'Đang hoạt động',
            contractDate: '15/01/2023'
        },
        {
            id: 'DL002',
            name: 'Nhà thuốc FPT Long Châu',
            type: 'Không độc quyền',
            region: 'Miền Nam',
            revenue: '78M',
            commission: '6.2M',
            status: 'Đang hoạt động',
            contractDate: '20/03/2023'
        }
    ];
    
    const tbody = document.getElementById('distributors-table-body');
    if (tbody) {
        tbody.innerHTML = distributors.map(dist => `
            <tr>
                <td>${dist.id}</td>
                <td>${dist.name}</td>
                <td>${dist.type}</td>
                <td>${dist.region}</td>
                <td>${dist.revenue}</td>
                <td>${dist.commission}</td>
                <td><span class="status active">${dist.status}</span></td>
                <td>${dist.contractDate}</td>
                <td>
                    <button class="btn-sm" onclick="viewDistributor('${dist.id}')">Xem</button>
                    <button class="btn-sm" onclick="editDistributor('${dist.id}')">Sửa</button>
                </td>
            </tr>
        `).join('');
    }
}

function loadTerritoriesData() {
    console.log('Loading territories data...');
}

function loadCommissionsData() {
    console.log('Loading commissions data...');
}
function searchProducts() { console.log('Search products'); }
function filterProducts() { console.log('Filter products'); }
function showStockInModal() { console.log('Stock in modal'); }
function showStockOutModal() { console.log('Stock out modal'); }
function showStockTransferModal() { console.log('Stock transfer modal'); }
function showStockAdjustmentModal() { console.log('Stock adjustment modal'); }
function exportInventoryReport() { console.log('Export inventory report'); }
function filterMovements() { console.log('Filter movements'); }
function showPendingOrders() { console.log('Show pending orders'); }

// Make functions globally available
window.initNavigation = initNavigation;
window.initializeModule = initializeModule;
window.initDashboard = initDashboard;
window.initCustomerManagement = initCustomerManagement;
window.initProductCatalog = initProductCatalog;
window.initInventoryManagement = initInventoryManagement;
window.initSalesOrderManagement = initSalesOrderManagement;
window.initPurchaseOrderManagement = initPurchaseOrderManagement;
window.initDistributionManagement = initDistributionManagement;
window.initSalesTeam = initSalesTeam;
window.initPromotionsManagement = initPromotionsManagement;
window.initPricingManagement = initPricingManagement;
window.initComplianceManagement = initComplianceManagement;
window.initReportsManagement = initReportsManagement;
window.initSettingsManagement = initSettingsManagement;
window.viewCustomer = viewCustomer;
window.editCustomer = editCustomer;
window.deleteCustomer = deleteCustomer;
window.changePage = changePage;
window.searchCustomers = searchCustomers;
window.filterCustomers = filterCustomers;
window.switchOrderView = switchOrderView;
window.filterByStatus = filterByStatus;
window.searchOrders = searchOrders;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.downloadCSV = downloadCSV;
window.showAddCustomerModal = showAddCustomerModal;
window.importCustomerData = importCustomerData;
window.exportCustomerData = exportCustomerData;
window.syncCustomerData = syncCustomerData;
window.showCreateOrderModal = showCreateOrderModal;
window.showQuickOrderModal = showQuickOrderModal;
window.showOrderTemplates = showOrderTemplates;
window.exportOrderData = exportOrderData;
window.showCreatePurchaseOrderModal = showCreatePurchaseOrderModal;
window.showSupplierCatalog = showSupplierCatalog;
window.showPurchaseTemplates = showPurchaseTemplates;
window.exportPurchaseData = exportPurchaseData;
window.showAddDistributorModal = showAddDistributorModal;
window.showTerritoryMap = showTerritoryMap;
window.showPerformanceReport = showPerformanceReport;
window.exportDistributionData = exportDistributionData;
window.showAddSalesPersonModal = showAddSalesPersonModal;
window.showAssignTerritoryModal = showAssignTerritoryModal;
window.showKPISettingsModal = showKPISettingsModal;
window.exportSalesData = exportSalesData;
window.showCreatePromotionModal = showCreatePromotionModal;
window.showVolumeDiscountModal = showVolumeDiscountModal;
window.showSeasonalPromotionModal = showSeasonalPromotionModal;
window.exportPromotionReport = exportPromotionReport;
window.showCreatePriceListModal = showCreatePriceListModal;
window.showBulkPriceUpdateModal = showBulkPriceUpdateModal;
window.showCustomerPricingModal = showCustomerPricingModal;
window.exportPricingReport = exportPricingReport;
window.showRegulatoryReportModal = showRegulatoryReportModal;
window.showLicenseManagementModal = showLicenseManagementModal;
window.showAuditTrailModal = showAuditTrailModal;
window.exportComplianceReport = exportComplianceReport;
window.switchComplianceTab = switchComplianceTab;
window.switchSettingsTab = switchSettingsTab;
window.showReportCategory = showReportCategory;
window.switchDistributionTab = switchDistributionTab;
window.switchSalesTab = switchSalesTab;
// Product management functions will be implemented separately
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.showStockInModal = showStockInModal;
window.showStockOutModal = showStockOutModal;
window.showStockTransferModal = showStockTransferModal;
window.showStockAdjustmentModal = showStockAdjustmentModal;
window.exportInventoryReport = exportInventoryReport;
window.filterMovements = filterMovements;
window.showPendingOrders = showPendingOrders;

// Tax Management Functions
function initTaxManagement() {
    console.log('Tax Management module initialized');
    loadTaxOverviewData();
    setupTaxEventListeners();
}

function switchTaxTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load specific tab data
    switch(tabName) {
        case 'overview':
            loadTaxOverviewData();
            break;
        case 'revenue':
            loadTaxRevenueData();
            break;
        case 'calculations':
            loadTaxCalculationsData();
            break;
        case 'reports':
            loadTaxReportsData();
            break;
        case 'documents':
            loadTaxDocumentsData();
            break;
        case 'compliance':
            loadTaxComplianceData();
            break;
    }
}

function loadTaxOverviewData() {
    // Sample tax data
    const taxData = {
        totalTaxableRevenue: 15000000000,
        totalVATOwed: 1500000000,
        totalCITOwed: 750000000,
        totalPITOwed: 250000000
    };
    
    // Update overview statistics
    const totalTaxableRevenueEl = document.getElementById('totalTaxableRevenue');
    const totalVATOwedEl = document.getElementById('totalVATOwed');
    const totalCITOwedEl = document.getElementById('totalCITOwed');
    const totalPITOwedEl = document.getElementById('totalPITOwed');
    
    if (totalTaxableRevenueEl) totalTaxableRevenueEl.textContent = formatCurrency(taxData.totalTaxableRevenue);
    if (totalVATOwedEl) totalVATOwedEl.textContent = formatCurrency(taxData.totalVATOwed);
    if (totalCITOwedEl) totalCITOwedEl.textContent = formatCurrency(taxData.totalCITOwed);
    if (totalPITOwedEl) totalPITOwedEl.textContent = formatCurrency(taxData.totalPITOwed);
}

function loadTaxRevenueData() {
    // Sample revenue data
    const revenueData = {
        totalRevenue: 15000000000,
        medicalRevenue: 8000000000,
        medicineRevenue: 6000000000,
        otherRevenue: 1000000000,
        totalExpenses: 12000000000,
        staffExpenses: 5000000000,
        materialExpenses: 4000000000,
        operatingExpenses: 3000000000
    };
    
    // Update revenue summary
    const totalRevenueEl = document.getElementById('totalRevenue');
    const medicalRevenueEl = document.getElementById('medicalRevenue');
    const medicineRevenueEl = document.getElementById('medicineRevenue');
    const otherRevenueEl = document.getElementById('otherRevenue');
    const totalExpensesEl = document.getElementById('totalExpenses');
    const staffExpensesEl = document.getElementById('staffExpenses');
    const materialExpensesEl = document.getElementById('materialExpenses');
    const operatingExpensesEl = document.getElementById('operatingExpenses');
    
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(revenueData.totalRevenue);
    if (medicalRevenueEl) medicalRevenueEl.textContent = formatCurrency(revenueData.medicalRevenue);
    if (medicineRevenueEl) medicineRevenueEl.textContent = formatCurrency(revenueData.medicineRevenue);
    if (otherRevenueEl) otherRevenueEl.textContent = formatCurrency(revenueData.otherRevenue);
    if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(revenueData.totalExpenses);
    if (staffExpensesEl) staffExpensesEl.textContent = formatCurrency(revenueData.staffExpenses);
    if (materialExpensesEl) materialExpensesEl.textContent = formatCurrency(revenueData.materialExpenses);
    if (operatingExpensesEl) operatingExpensesEl.textContent = formatCurrency(revenueData.operatingExpenses);
}

function loadTaxCalculationsData() {
    console.log('Tax calculations data loaded');
}

function loadTaxReportsData() {
    console.log('Tax reports data loaded');
}

function loadTaxDocumentsData() {
    console.log('Tax documents data loaded');
}

function loadTaxComplianceData() {
    console.log('Tax compliance data loaded');
}

function loadTaxData() {
    const period = document.getElementById('taxPeriod')?.value;
    const branch = document.getElementById('taxBranch')?.value;
    
    console.log('Loading tax data for period:', period, 'branch:', branch);
    loadTaxRevenueData();
    showNotification('Dữ liệu thuế đã được tải thành công', 'success');
}

function calculateVAT() {
    const revenue10 = parseFloat(document.getElementById('revenue10')?.value || 0);
    const revenue8 = parseFloat(document.getElementById('revenue8')?.value || 0);
    const revenue5 = parseFloat(document.getElementById('revenue5')?.value || 0);
    const inputVAT = parseFloat(document.getElementById('inputVAT')?.value || 0);
    
    const outputVAT = (revenue10 * 0.1) + (revenue8 * 0.08) + (revenue5 * 0.05);
    const vatPayable = Math.max(0, outputVAT - inputVAT);
    
    const outputVATEl = document.getElementById('outputVAT');
    const vatPayableEl = document.getElementById('vatPayable');
    
    if (outputVATEl) outputVATEl.textContent = formatCurrency(outputVAT);
    if (vatPayableEl) vatPayableEl.textContent = formatCurrency(vatPayable);
    
    showNotification('Tính thuế GTGT thành công', 'success');
}

function calculateCIT() {
    const totalIncome = parseFloat(document.getElementById('totalIncome')?.value || 0);
    const deductibleExpenses = parseFloat(document.getElementById('deductibleExpenses')?.value || 0);
    const citRate = parseFloat(document.getElementById('citRate')?.value || 20) / 100;
    
    const taxableIncome = Math.max(0, totalIncome - deductibleExpenses);
    const citPayable = taxableIncome * citRate;
    
    const taxableIncomeEl = document.getElementById('taxableIncome');
    const citPayableEl = document.getElementById('citPayable');
    
    if (taxableIncomeEl) taxableIncomeEl.textContent = formatCurrency(taxableIncome);
    if (citPayableEl) citPayableEl.textContent = formatCurrency(citPayable);
    
    showNotification('Tính thuế TNDN thành công', 'success');
}

function calculatePIT() {
    const totalSalary = parseFloat(document.getElementById('totalSalary')?.value || 0);
    const dependents = parseInt(document.getElementById('dependents')?.value || 0);
    const socialInsurance = parseFloat(document.getElementById('socialInsurance')?.value || 0);
    
    const personalDeduction = 11000000; // 11 million VND per month
    const dependentDeduction = dependents * 4400000; // 4.4 million VND per dependent
    
    const pitTaxableIncome = Math.max(0, totalSalary - personalDeduction - dependentDeduction - socialInsurance);
    
    // Progressive tax calculation
    let pitPayable = 0;
    if (pitTaxableIncome > 80000000) {
        pitPayable = pitTaxableIncome * 0.35;
    } else if (pitTaxableIncome > 52000000) {
        pitPayable = pitTaxableIncome * 0.30;
    } else if (pitTaxableIncome > 32000000) {
        pitPayable = pitTaxableIncome * 0.25;
    } else if (pitTaxableIncome > 18000000) {
        pitPayable = pitTaxableIncome * 0.20;
    } else if (pitTaxableIncome > 10000000) {
        pitPayable = pitTaxableIncome * 0.15;
    } else if (pitTaxableIncome > 5000000) {
        pitPayable = pitTaxableIncome * 0.10;
    } else {
        pitPayable = pitTaxableIncome * 0.05;
    }
    
    const pitTaxableIncomeEl = document.getElementById('pitTaxableIncome');
    const pitPayableEl = document.getElementById('pitPayable');
    
    if (pitTaxableIncomeEl) pitTaxableIncomeEl.textContent = formatCurrency(pitTaxableIncome);
    if (pitPayableEl) pitPayableEl.textContent = formatCurrency(pitPayable);
    
    showNotification('Tính thuế TNCN thành công', 'success');
}

function generateTaxReport() {
    const reportType = document.getElementById('reportType')?.value;
    const reportPeriod = document.getElementById('reportPeriod')?.value;
    const reportMonth = document.getElementById('reportMonth')?.value;
    
    console.log('Generating tax report:', reportType, reportPeriod, reportMonth);
    
    const reportDisplay = document.getElementById('taxReportDisplay');
    if (reportDisplay) {
        reportDisplay.innerHTML = `
            <div class="report-content">
                <h3>Báo cáo ${getReportTypeLabel(reportType)} - ${reportPeriod} ${reportMonth}</h3>
                <div class="report-data">
                    <p>Báo cáo đã được tạo thành công.</p>
                    <p>Thời gian tạo: ${new Date().toLocaleString('vi-VN')}</p>
                </div>
            </div>
        `;
    }
    
    showNotification('Báo cáo thuế đã được tạo thành công', 'success');
}

function getReportTypeLabel(type) {
    const labels = {
        'vat': 'Thuế GTGT',
        'cit': 'Thuế TNDN',
        'pit': 'Thuế TNCN',
        'summary': 'Tổng hợp'
    };
    return labels[type] || type;
}

function exportTaxReport(format) {
    console.log('Exporting tax report in format:', format);
    showNotification(`Đang xuất báo cáo định dạng ${format.toUpperCase()}...`, 'info');
}

function printTaxReport() {
    console.log('Printing tax report');
    window.print();
}

function submitTaxReport() {
    console.log('Submitting tax report');
    showNotification('Báo cáo thuế đã được nộp thành công', 'success');
}

function exportTaxTransactions() {
    console.log('Exporting tax transactions');
    showNotification('Đang xuất dữ liệu giao dịch...', 'info');
}

function uploadTaxDocument() {
    const fileInput = document.getElementById('taxDocumentFile');
    const documentType = document.getElementById('documentType')?.value;
    const description = document.getElementById('documentDescription')?.value;
    
    if (fileInput && fileInput.files.length > 0) {
        console.log('Uploading tax document:', fileInput.files[0].name, documentType, description);
        showNotification('Chứng từ đã được tải lên thành công', 'success');
    } else {
        showNotification('Vui lòng chọn file để tải lên', 'warning');
    }
}

function viewDocument(docId) {
    console.log('Viewing document:', docId);
    showNotification('Đang mở chứng từ...', 'info');
}

function downloadDocument(docId) {
    console.log('Downloading document:', docId);
    showNotification('Đang tải xuống chứng từ...', 'info');
}

function deleteDocument(docId) {
    if (confirm('Bạn có chắc chắn muốn xóa chứng từ này?')) {
        console.log('Deleting document:', docId);
        showNotification('Chứng từ đã được xóa', 'success');
    }
}

function viewReport(reportId) {
    console.log('Viewing report:', reportId);
    showNotification('Đang mở báo cáo...', 'info');
}

function downloadReport(reportId) {
    console.log('Downloading report:', reportId);
    showNotification('Đang tải xuống báo cáo...', 'info');
}

function editReport(reportId) {
    console.log('Editing report:', reportId);
    showNotification('Đang mở chế độ chỉnh sửa...', 'info');
}

function deleteReport(reportId) {
    if (confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
        console.log('Deleting report:', reportId);
        showNotification('Báo cáo đã được xóa', 'success');
    }
}

function createTaxReport(type, period) {
    console.log('Creating tax report:', type, period);
    showNotification('Đang tạo báo cáo thuế...', 'info');
}

function handleOverdueReport(reportId) {
    console.log('Handling overdue report:', reportId);
    showNotification('Đang xử lý báo cáo quá hạn...', 'warning');
}

function viewTaxUpdate(updateId) {
    console.log('Viewing tax update:', updateId);
    showNotification('Đang mở thông tin cập nhật...', 'info');
}

function setupTaxEventListeners() {
    // Add event listeners for tax management forms
    const taxDocumentFile = document.getElementById('taxDocumentFile');
    if (taxDocumentFile) {
        taxDocumentFile.addEventListener('change', function() {
            const files = this.files;
            if (files.length > 0) {
                console.log('Files selected:', files.length);
            }
        });
    }
}

// Export tax management functions to window
window.initTaxManagement = initTaxManagement;
window.switchTaxTab = switchTaxTab;
window.loadTaxData = loadTaxData;
window.calculateVAT = calculateVAT;
window.calculateCIT = calculateCIT;
window.calculatePIT = calculatePIT;
window.generateTaxReport = generateTaxReport;
window.exportTaxReport = exportTaxReport;
window.printTaxReport = printTaxReport;
window.submitTaxReport = submitTaxReport;
window.exportTaxTransactions = exportTaxTransactions;
window.uploadTaxDocument = uploadTaxDocument;
window.viewDocument = viewDocument;
window.downloadDocument = downloadDocument;
window.deleteDocument = deleteDocument;
window.viewReport = viewReport;
window.downloadReport = downloadReport;
window.editReport = editReport;
window.deleteReport = deleteReport;
window.createTaxReport = createTaxReport;
window.handleOverdueReport = handleOverdueReport;
window.viewTaxUpdate = viewTaxUpdate;