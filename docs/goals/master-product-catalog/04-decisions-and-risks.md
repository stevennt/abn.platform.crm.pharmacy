# Master Product Catalog — Decisions and Risks

## Assumptions
- MasterProduct is a global model (no pharmacyId) — shared across all tenants
- Existing products without masterProductId continue to work unchanged

## Decisions Made by Inference
- **Additive model**: added MasterProduct as entirely new model rather than restructuring Product — avoids migration complexity, preserves backward compatibility
- **Nullable masterProductId**: existing products get null, new products can link to a master — no data migration needed
- **Override model**: pharmacy keeps its own code/SKU, prices, minStock — base fields (name, ingredient, category, manufacturer, unit) come from master but can be overwritten at the Product level since they remain on the Product model
- **No cascade delete**: MasterProduct won't cascade-delete Products — prevents accidental data loss

## Decisions Requiring User Approval
(none)

## Compatibility Risks
- All existing Product API routes return the same fields — consumers unaffected
- `POST /api/products` accepts the same body — `masterProductId` is optional
- Seed continues to work with existing product definitions

## Production/Data Risks
- SQLite — no FK enforcement at DB level. Prisma handles referential integrity.
- `npx prisma db push --force-reset` will wipe existing data (already development-only)

## Rollback or Recovery Notes
- Remove `MasterProduct` model and `masterProductId` column — full rollback
