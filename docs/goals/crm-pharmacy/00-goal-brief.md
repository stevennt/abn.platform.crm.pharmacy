# Goal Brief: ABN PharmaCRM - Comprehensive Pharmacy CRM

## Goal Statement
Build a comprehensive, production-ready CRM system for pharmaceutical trading (PharmaCRM) that covers the full lifecycle of pharmaceutical sales, inventory, distribution, compliance, and customer management as specified in `docs/MedicalTrading/abn.medicine.trading.crm.md`.

## Inferred Context
- Existing prototype at `docs/MedicalTrading/` contains a static HTML/CSS/JS single-page app with extensive UI mockups for 15+ modules
- No backend, database, or real data persistence exists
- The repo `abn.platform.crm.pharmacy` is a greenfield project with only spec and prototype files
- The ABN ecosystem has Axum/PostgreSQL API servers, but this CRM may need its own stack or integrate with existing services

## Target Users/Roles/Systems
- Quản trị hệ thống (System Admin) - user management, permissions, config
- Quản lý kho (Warehouse Manager) - medicine, inventory, batch tracking
- Nhân viên kinh doanh (Sales Staff) - orders, customers, inventory lookup
- Trình dược viên (Pharmacy Rep) - territory management, order placement
- Kế toán (Accountant) - debt management, invoice sync
- Quản lý phân phối (Distribution Manager) - agency management, promotions
- Chăm sóc khách hàng (Customer Care) - history, email/SMS automation

## Success Criteria
1. Working web application accessible via browser with all 15+ modules functional
2. User authentication with role-based access control
3. CRUD operations for all entities (customers, products, orders, inventory, etc.)
4. Dashboard with real-time statistics and alerts
5. Inventory tracking by lot/batch with expiry warnings
6. Sales order processing pipeline (create → approve → ship → complete)
7. Purchase order management from suppliers
8. Distribution & agency management with territory mapping
9. Sales team management with KPI tracking
10. Reports and analytics module
11. Data persistence (database-backed)
12. Responsive UI (desktop + mobile)

## Non-Goals
- Integration with external accounting software (API stubs only)
- Real SMS/Email sending (stub/mock implementations)
- Multi-channel integration (Facebook, Zalo, etc.) - stubs only
- Mobile native app (responsive web only)
- Real AI-powered features (UI placeholders only)
- Production deployment to ABN infrastructure

## Constraints
- Must use modern web stack (Next.js 14+ with TypeScript)
- Database must support the full data model
- Backward compatibility with existing prototype HTML structure
- All text/labels must support Vietnamese language
- Must be buildable and runnable locally

## Safety/Compatibility Boundaries
- No production data mutation
- Local development only; no deployment to production servers
- No external API calls to real services (SMS, Email, Voip)
- Seed data for development/demo purposes only

## Verification Standard
- `npm run build` must succeed
- `npm run dev` must start successfully
- All CRUD operations must work for core entities
- Screenshots/evidence of each module rendering with data
