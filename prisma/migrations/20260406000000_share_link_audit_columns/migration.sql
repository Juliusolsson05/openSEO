-- DropIndex
DROP INDEX "BlogPost_share_token_key";

-- AlterTable: drop dead share columns from BlogPost
ALTER TABLE "BlogPost" DROP COLUMN "share_enabled",
DROP COLUMN "share_expires_at",
DROP COLUMN "share_token";

-- AlterTable: add audit columns to ShareLink (companyId nullable first for backfill)
ALTER TABLE "ShareLink" ADD COLUMN "companyId" INTEGER,
ADD COLUMN "createdByUserId" TEXT,
ADD COLUMN "revokedAt" TIMESTAMP(3);

-- Backfill companyId from BlogPost
UPDATE "ShareLink" sl
SET "companyId" = bp."companyId"
FROM "BlogPost" bp
WHERE sl."postId" = bp."id" AND bp."companyId" IS NOT NULL;

-- Delete orphan rows where companyId could not be backfilled
DELETE FROM "ShareLink" WHERE "companyId" IS NULL;

-- Now enforce NOT NULL on companyId
ALTER TABLE "ShareLink" ALTER COLUMN "companyId" SET NOT NULL;

-- Drop the default uuid() on token (callers must supply it)
ALTER TABLE "ShareLink" ALTER COLUMN "token" DROP DEFAULT;

-- AlterTable: SystemSetting updatedAt (from prisma diff)
ALTER TABLE "SystemSetting" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "ShareLink_companyId_idx" ON "ShareLink"("companyId");

-- CreateIndex
CREATE INDEX "ShareLink_token_idx" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_revokedAt_idx" ON "ShareLink"("revokedAt");

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
