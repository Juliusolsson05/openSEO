-- Convert element_type from enum to text (preserving existing data)

-- BlogPostElement: cast enum to text
ALTER TABLE "BlogPostElement" ALTER COLUMN "element_type" TYPE TEXT USING "element_type"::TEXT;

-- BlogElementTemplate: cast enum to text
ALTER TABLE "BlogElementTemplate" ALTER COLUMN "element_type" TYPE TEXT USING "element_type"::TEXT;

-- Drop the now-unused enums
DROP TYPE IF EXISTS "BlogPostElementType";
DROP TYPE IF EXISTS "BlogElementTemplateType";
