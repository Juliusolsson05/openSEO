-- Add PUBLISHED value to the existing TitleStatus Postgres enum.
-- The Prisma schema already declares this value; this migration brings the
-- database in sync so that writes of status = 'PUBLISHED' succeed.
--
-- ALTER TYPE ... ADD VALUE cannot run inside a transaction block in older
-- Postgres versions. Prisma runs migrations in autocommit for each statement,
-- so a bare ALTER TYPE is safe here.

ALTER TYPE "TitleStatus" ADD VALUE IF NOT EXISTS 'PUBLISHED';
