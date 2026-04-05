-- Multi-tenant uniqueness migration.
--
-- Drops global scalar unique indexes on tenant-owned models and replaces them
-- with composite uniques that include the tenant scope (companyId, productId,
-- or dictionaryId as appropriate). Also introduces Product.externalId so the
-- Shopify import upsert can stop injecting Shopify ids into the internal
-- autoincrement primary key, and denormalizes companyId onto ProductVariant
-- so SKU uniqueness can be enforced per merchant.
--
-- See prisma/migrations/_preflight/multi-tenant-uniqueness.sql for the
-- duplicate-detection script that must run green against the target database
-- before this migration is applied.

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "Title_slug_key";

-- DropIndex
DROP INDEX "BlogPost_slug_key";

-- DropIndex
DROP INDEX "ProductVariant_sku_key";

-- DropIndex
DROP INDEX "Tag_name_key";

-- DropIndex
DROP INDEX "Dictionary_slug_key";

-- AlterTable: Product.externalId
ALTER TABLE "Product" ADD COLUMN "externalId" TEXT;

-- Backfill externalId from legacy Shopify-id misuse. Any Product row whose id
-- is greater than 1e9 is almost certainly the Shopify id that used to be
-- written straight into the autoincrement PK (Postgres would never reach that
-- range on its own in any realistic deployment window). Copy it out as text
-- so the new (companyId, externalId) unique can key on it.
UPDATE "Product" SET "externalId" = id::text WHERE id > 1000000000;

-- Reset the Product id sequence to MAX(id) + 1 so future autoincrement rows
-- do not collide with the legacy Shopify-injected ids we just left in place.
-- We deliberately do NOT rewrite the legacy ids because other tables
-- (ProductVariant, ProductImage, Tag, the various _CategoryToProduct style
-- join tables if any) reference them via foreign key.
SELECT setval(
  pg_get_serial_sequence('"Product"', 'id'),
  COALESCE((SELECT MAX(id) FROM "Product"), 1) + 1,
  false
);

-- AlterTable: ProductVariant.companyId (denormalized from Product)
ALTER TABLE "ProductVariant" ADD COLUMN "companyId" INTEGER;

-- Backfill denormalized companyId from the parent Product.
UPDATE "ProductVariant" v
   SET "companyId" = p."companyId"
  FROM "Product" p
 WHERE v."productId" = p.id;

-- CreateIndex
CREATE UNIQUE INDEX "Category_companyId_name_key" ON "Category"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_companyId_slug_key" ON "Category"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Title_companyId_slug_key" ON "Title"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_companyId_slug_key" ON "BlogPost"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_companyId_externalId_key" ON "Product"("companyId", "externalId");

-- CreateIndex
CREATE INDEX "ProductVariant_companyId_idx" ON "ProductVariant"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_companyId_sku_key" ON "ProductVariant"("companyId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_productId_name_key" ON "Tag"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Dictionary_companyId_slug_key" ON "Dictionary"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Word_dictionaryId_keyword_key" ON "Word"("dictionaryId", "keyword");
