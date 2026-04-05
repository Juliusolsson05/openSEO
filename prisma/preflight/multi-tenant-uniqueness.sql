-- prisma/migrations/_preflight/multi-tenant-uniqueness.sql
--
-- Pre-flight duplicate detection for the multi-tenant-uniqueness migration.
--
-- Run with:
--   psql "$DATABASE_URL" -f prisma/migrations/_preflight/multi-tenant-uniqueness.sql
--
-- Any non-empty result from blocks 1-8 means the corresponding CREATE UNIQUE INDEX
-- in the main migration will fail. Remediate BEFORE running `prisma migrate deploy`.
--
-- Block 9 returns the current Product id range so we can reason about the Shopify
-- id misuse; block 10 counts the rows whose id value looks like a Shopify id and
-- therefore must be copied to the new `externalId` column.

\echo '--- 1. Category: duplicate (companyId, name) ---'
SELECT "companyId", name, COUNT(*) AS dup_count
FROM "Category"
WHERE "companyId" IS NOT NULL
GROUP BY "companyId", name
HAVING COUNT(*) > 1;

\echo '--- 2. Category: duplicate (companyId, slug) ---'
SELECT "companyId", slug, COUNT(*) AS dup_count
FROM "Category"
WHERE "companyId" IS NOT NULL
GROUP BY "companyId", slug
HAVING COUNT(*) > 1;

\echo '--- 3. Title: duplicate (companyId, slug) ---'
SELECT "companyId", slug, COUNT(*) AS dup_count
FROM "Title"
WHERE "companyId" IS NOT NULL
GROUP BY "companyId", slug
HAVING COUNT(*) > 1;

\echo '--- 4. BlogPost: duplicate (companyId, slug) ---'
SELECT "companyId", slug, COUNT(*) AS dup_count
FROM "BlogPost"
WHERE "companyId" IS NOT NULL
GROUP BY "companyId", slug
HAVING COUNT(*) > 1;

\echo '--- 5. Dictionary: duplicate (companyId, slug) ---'
SELECT "companyId", slug, COUNT(*) AS dup_count
FROM "Dictionary"
WHERE "companyId" IS NOT NULL
GROUP BY "companyId", slug
HAVING COUNT(*) > 1;

\echo '--- 6. Tag: duplicate (productId, name) ---'
SELECT "productId", name, COUNT(*) AS dup_count
FROM "Tag"
GROUP BY "productId", name
HAVING COUNT(*) > 1;

\echo '--- 7. ProductVariant: duplicate (companyId, sku) via join ---'
SELECT p."companyId", v.sku, COUNT(*) AS dup_count
FROM "ProductVariant" v
JOIN "Product" p ON p.id = v."productId"
WHERE p."companyId" IS NOT NULL AND v.sku <> ''
GROUP BY p."companyId", v.sku
HAVING COUNT(*) > 1;

\echo '--- 8. Word: duplicate (dictionaryId, keyword) ---'
SELECT "dictionaryId", keyword, COUNT(*) AS dup_count
FROM "Word"
GROUP BY "dictionaryId", keyword
HAVING COUNT(*) > 1;

\echo '--- 9. Product: current id range ---'
SELECT MIN(id) AS min_id, MAX(id) AS max_id, COUNT(*) AS total
FROM "Product";

\echo '--- 10. Product: rows whose id looks like a Shopify id (> 1e9) ---'
SELECT COUNT(*) AS shopify_like_ids
FROM "Product"
WHERE id > 1000000000;
