# Master Product Catalog — Goal Brief

## Goal Statement
Have a master product catalog, then each pharmacy can have their derivative copy of the product catalog with some or all of those products, and with their own descriptions, SKUs, but the base info is shared and maintained centrally.

## Inferred Context
- The CRM is a multi-tenant Next.js app with Prisma/SQLite
- Currently each `Product` is owned directly by a `Pharmacy` (via `pharmacyId`)
- Products are duplicated across pharmacies with no central source of truth
- Changing base product info (name, ingredient, manufacturer) requires updating every pharmacy individually
- This is wasteful and error-prone

## Target Users/Roles/Systems
- **Admin users**: create and maintain the master product catalog centrally
- **Pharmacy staff**: select products from the master catalog for their pharmacy, set their own SKU/code, description, prices, and stock thresholds
- **CEO/Role-switcher**: see consistent product info when switching between pharmacies

## Success Criteria
1. `MasterProduct` model exists with fields: code (unique), name, activeIngredient, category, manufacturer, unit
2. `Product` model has an optional `masterProductId` FK to `MasterProduct`, preserving backward compatibility for existing products
3. API endpoints for CRUD on `MasterProduct`
4. Product create/edit form allows linking to a master product
5. Existing products continue to work without a master product link (null masterProductId)
6. Seed data includes master products linked to pharmacy products
7. Build passes with 0 errors, lint passes with 0 warnings
8. Runtime smoke-test: can create a master product, can link a pharmacy product to it

## Non-Goals
- Migrating existing standalone products to master products (can be done later as data cleanup)
- Pharmacy-specific pricing overrides at the product level (already handled by PriceList model)
- Syncing logic between master and derived products (manual override model — base fields are copied at link time)

## Constraints
- Must preserve backward compatibility for all existing API routes and UI screens
- No breaking changes to existing Product model fields
- SQLite — no native FK enforcement at DB level (Prisma handles it)
- Prisma 5 — compound unique constraints already in use

## Safety/Compatibility Boundaries
- `Product` model keeps all existing fields; `masterProductId` is added as optional
- All existing API routes `/api/products*` continue to work unchanged
- Existing seed data continues to work (masterProductId = null)
- No production data mutation

## Verification Standard
- `npm run build` — 0 errors
- `npm run lint` — 0 warnings
- Schema push — succeeds
- Seed — succeeds with master products
- Manual smoke: verify master product CRUD via API
