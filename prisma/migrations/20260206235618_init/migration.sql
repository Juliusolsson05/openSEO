-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('DEMO', 'CLIENT', 'AGENCY', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "TitleStatus" AS ENUM ('TO_BE_GENERATED', 'APPROVED', 'REJECTED', 'GENERATED');

-- CreateEnum
CREATE TYPE "TitleOperation" AS ENUM ('NONE', 'POST_SYNCING', 'KEYWORD_SYNCING');

-- CreateEnum
CREATE TYPE "BlogPostElementType" AS ENUM ('INTRODUCTION', 'CONCLUSION', 'FAQ', 'IMAGE', 'PARAGRAPH', 'LIST_PARAGRAPH', 'NUMBERED_LIST_PARAGRAPH', 'QUOTE', 'LIST_FEATURED_SNIPPET_BLOCK', 'FEATURED_SNIPPET_BLOCK', 'GLOSSARY', 'PRODUCT_RECOMMENDATIONS');

-- CreateEnum
CREATE TYPE "BlogElementTemplateType" AS ENUM ('INTRODUCTION', 'CONCLUSION', 'FAQ', 'IMAGE', 'PARAGRAPH', 'LIST_PARAGRAPH', 'NUMBERED_LIST_PARAGRAPH', 'QUOTE', 'LIST_FEATURED_SNIPPET_BLOCK', 'FEATURED_SNIPPET_BLOCK', 'GLOSSARY', 'PRODUCT_RECOMMENDATIONS', 'CTA');

-- CreateEnum
CREATE TYPE "DictionaryStatus" AS ENUM ('IN_PROGRESS', 'KEYWORD_GENERATION', 'DEFINITION_GENERATION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WordPriority" AS ENUM ('HIGH', 'LOW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "firebaseUid" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'DEMO',
    "companyId" INTEGER,
    "demoExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "business_type" TEXT NOT NULL,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aurora_enabled" BOOLEAN NOT NULL DEFAULT false,
    "pulse_enabled" BOOLEAN NOT NULL DEFAULT false,
    "echo_enabled" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "api_endpoint" TEXT,
    "api_key" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{"business_description":"","industry_description":""}',

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BulkSchedule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "interval_days" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER,

    CONSTRAINT "BulkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Title" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "title_text" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "seo_title" TEXT,
    "focus_keyword" TEXT,
    "status" "TitleStatus" NOT NULL DEFAULT 'TO_BE_GENERATED',
    "operation" "TitleOperation" NOT NULL DEFAULT 'NONE',
    "scheduled_date" TIMESTAMP(3),
    "bulkScheduleId" INTEGER,
    "generated_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blogPostId" INTEGER,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER,
    "title_text" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "seo_title" TEXT,
    "focus_keyword" TEXT,
    "status" "TitleStatus" NOT NULL DEFAULT 'TO_BE_GENERATED',
    "operation" "TitleOperation" NOT NULL DEFAULT 'NONE',
    "scheduled_date" TIMESTAMP(3),
    "bulkScheduleId" INTEGER,
    "generated_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cover_image" JSONB NOT NULL DEFAULT '{}',
    "meta_description" TEXT,
    "excerpt" TEXT,
    "image_generation" BOOLEAN NOT NULL DEFAULT false,
    "keyword_synced" BOOLEAN NOT NULL DEFAULT false,
    "keyword_linked" BOOLEAN NOT NULL DEFAULT false,
    "posts_synced" BOOLEAN NOT NULL DEFAULT false,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "last_updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitlePostLink" (
    "fromTitleId" INTEGER NOT NULL,
    "toTitleId" INTEGER NOT NULL,

    CONSTRAINT "TitlePostLink_pkey" PRIMARY KEY ("fromTitleId","toTitleId")
);

-- CreateTable
CREATE TABLE "BlogPostPostLink" (
    "fromBlogPostId" INTEGER NOT NULL,
    "toBlogPostId" INTEGER NOT NULL,

    CONSTRAINT "BlogPostPostLink_pkey" PRIMARY KEY ("fromBlogPostId","toBlogPostId")
);

-- CreateTable
CREATE TABLE "BlogPublish" (
    "id" SERIAL NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    "sync_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remote_id" TEXT,
    "related_synced" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BlogPublish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostElement" (
    "id" SERIAL NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    "element_type" "BlogPostElementType" NOT NULL,
    "order" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostElement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ElementHyperlink" (
    "id" SERIAL NOT NULL,
    "blogPostElementId" INTEGER NOT NULL,
    "matched_keywords" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ElementHyperlink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "product_type" TEXT NOT NULL,
    "companyId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "compare_at_price" DECIMAL(10,2),
    "inventory_quantity" INTEGER NOT NULL,
    "weight" DECIMAL(10,2),
    "weight_unit" TEXT,
    "requires_shipping" BOOLEAN NOT NULL DEFAULT true,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "src" TEXT NOT NULL,
    "alt_text" TEXT,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dictionary" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "num_words" INTEGER NOT NULL,
    "current_letter" TEXT NOT NULL DEFAULT 'a',
    "status" "DictionaryStatus" NOT NULL DEFAULT 'KEYWORD_GENERATION',
    "companyId" INTEGER,
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "slug" TEXT NOT NULL DEFAULT 'dictionary/',

    CONSTRAINT "Dictionary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "dictionaryId" INTEGER NOT NULL,
    "letter" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "WordPriority" NOT NULL DEFAULT 'HIGH',
    "focus_keyword" TEXT,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryDefinition" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "seo_title" TEXT,
    "featured_google_snippet" TEXT NOT NULL,
    "meta_description" TEXT NOT NULL,
    "title1" TEXT NOT NULL,
    "text1" TEXT NOT NULL,
    "title2" TEXT NOT NULL,
    "text2" TEXT NOT NULL,
    "title3" TEXT NOT NULL,
    "text3" TEXT NOT NULL,
    "synonyms" JSONB NOT NULL DEFAULT '[]',
    "antonyms" JSONB NOT NULL DEFAULT '[]',
    "usage_examples" JSONB NOT NULL DEFAULT '[]',
    "related_keywords" JSONB NOT NULL DEFAULT '[]',
    "faqs" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "DictionaryDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsLog" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "json_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_synced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuilloBlogPostAnalysisLog" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "blogPostId" INTEGER NOT NULL,
    "analysis_data" JSONB NOT NULL,
    "openai_response_data" JSONB,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuilloBlogPostAnalysisLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuilloCompanyAnalysisLog" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "analyticsLogId" INTEGER,
    "analysis_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuilloCompanyAnalysisLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogElementTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "element_type" "BlogElementTemplateType" NOT NULL,
    "structure" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogElementTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CTA" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CTA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToTitle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CategoryToTitle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BlogPostToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BlogPostToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "BulkSchedule_companyId_idx" ON "BulkSchedule"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_companyId_idx" ON "Category"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Title_slug_key" ON "Title"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Title_blogPostId_key" ON "Title"("blogPostId");

-- CreateIndex
CREATE INDEX "Title_companyId_idx" ON "Title"("companyId");

-- CreateIndex
CREATE INDEX "Title_status_idx" ON "Title"("status");

-- CreateIndex
CREATE INDEX "Title_operation_idx" ON "Title"("operation");

-- CreateIndex
CREATE INDEX "Title_bulkScheduleId_idx" ON "Title"("bulkScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_companyId_idx" ON "BlogPost"("companyId");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_operation_idx" ON "BlogPost"("operation");

-- CreateIndex
CREATE INDEX "BlogPost_reviewed_idx" ON "BlogPost"("reviewed");

-- CreateIndex
CREATE INDEX "BlogPost_last_updated_idx" ON "BlogPost"("last_updated");

-- CreateIndex
CREATE INDEX "BlogPost_bulkScheduleId_idx" ON "BlogPost"("bulkScheduleId");

-- CreateIndex
CREATE INDEX "TitlePostLink_fromTitleId_idx" ON "TitlePostLink"("fromTitleId");

-- CreateIndex
CREATE INDEX "TitlePostLink_toTitleId_idx" ON "TitlePostLink"("toTitleId");

-- CreateIndex
CREATE INDEX "BlogPostPostLink_fromBlogPostId_idx" ON "BlogPostPostLink"("fromBlogPostId");

-- CreateIndex
CREATE INDEX "BlogPostPostLink_toBlogPostId_idx" ON "BlogPostPostLink"("toBlogPostId");

-- CreateIndex
CREATE INDEX "BlogPublish_blogPostId_idx" ON "BlogPublish"("blogPostId");

-- CreateIndex
CREATE INDEX "BlogPostElement_blogPostId_idx" ON "BlogPostElement"("blogPostId");

-- CreateIndex
CREATE INDEX "BlogPostElement_order_idx" ON "BlogPostElement"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ElementHyperlink_blogPostElementId_key" ON "ElementHyperlink"("blogPostElementId");

-- CreateIndex
CREATE INDEX "Product_title_idx" ON "Product"("title");

-- CreateIndex
CREATE INDEX "Product_vendor_idx" ON "Product"("vendor");

-- CreateIndex
CREATE INDEX "Product_product_type_idx" ON "Product"("product_type");

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_title_idx" ON "ProductVariant"("title");

-- CreateIndex
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_idx" ON "ProductImage"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_name_idx" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_productId_idx" ON "Tag"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Dictionary_slug_key" ON "Dictionary"("slug");

-- CreateIndex
CREATE INDEX "Dictionary_companyId_idx" ON "Dictionary"("companyId");

-- CreateIndex
CREATE INDEX "Word_dictionaryId_idx" ON "Word"("dictionaryId");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryDefinition_wordId_key" ON "DictionaryDefinition"("wordId");

-- CreateIndex
CREATE INDEX "AnalyticsLog_companyId_idx" ON "AnalyticsLog"("companyId");

-- CreateIndex
CREATE INDEX "QuilloBlogPostAnalysisLog_companyId_idx" ON "QuilloBlogPostAnalysisLog"("companyId");

-- CreateIndex
CREATE INDEX "QuilloBlogPostAnalysisLog_blogPostId_idx" ON "QuilloBlogPostAnalysisLog"("blogPostId");

-- CreateIndex
CREATE INDEX "QuilloCompanyAnalysisLog_companyId_idx" ON "QuilloCompanyAnalysisLog"("companyId");

-- CreateIndex
CREATE INDEX "QuilloCompanyAnalysisLog_analyticsLogId_idx" ON "QuilloCompanyAnalysisLog"("analyticsLogId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogElementTemplate_name_key" ON "BlogElementTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogElementTemplate_slug_key" ON "BlogElementTemplate"("slug");

-- CreateIndex
CREATE INDEX "Campaign_companyId_idx" ON "Campaign"("companyId");

-- CreateIndex
CREATE INDEX "CTA_campaignId_idx" ON "CTA"("campaignId");

-- CreateIndex
CREATE INDEX "_CategoryToTitle_B_index" ON "_CategoryToTitle"("B");

-- CreateIndex
CREATE INDEX "_BlogPostToCategory_B_index" ON "_BlogPostToCategory"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BulkSchedule" ADD CONSTRAINT "BulkSchedule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_bulkScheduleId_fkey" FOREIGN KEY ("bulkScheduleId") REFERENCES "BulkSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_bulkScheduleId_fkey" FOREIGN KEY ("bulkScheduleId") REFERENCES "BulkSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitlePostLink" ADD CONSTRAINT "TitlePostLink_fromTitleId_fkey" FOREIGN KEY ("fromTitleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TitlePostLink" ADD CONSTRAINT "TitlePostLink_toTitleId_fkey" FOREIGN KEY ("toTitleId") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostPostLink" ADD CONSTRAINT "BlogPostPostLink_fromBlogPostId_fkey" FOREIGN KEY ("fromBlogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostPostLink" ADD CONSTRAINT "BlogPostPostLink_toBlogPostId_fkey" FOREIGN KEY ("toBlogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPublish" ADD CONSTRAINT "BlogPublish_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostElement" ADD CONSTRAINT "BlogPostElement_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElementHyperlink" ADD CONSTRAINT "ElementHyperlink_blogPostElementId_fkey" FOREIGN KEY ("blogPostElementId") REFERENCES "BlogPostElement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dictionary" ADD CONSTRAINT "Dictionary_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_dictionaryId_fkey" FOREIGN KEY ("dictionaryId") REFERENCES "Dictionary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DictionaryDefinition" ADD CONSTRAINT "DictionaryDefinition_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsLog" ADD CONSTRAINT "AnalyticsLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuilloBlogPostAnalysisLog" ADD CONSTRAINT "QuilloBlogPostAnalysisLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuilloBlogPostAnalysisLog" ADD CONSTRAINT "QuilloBlogPostAnalysisLog_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuilloCompanyAnalysisLog" ADD CONSTRAINT "QuilloCompanyAnalysisLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuilloCompanyAnalysisLog" ADD CONSTRAINT "QuilloCompanyAnalysisLog_analyticsLogId_fkey" FOREIGN KEY ("analyticsLogId") REFERENCES "AnalyticsLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CTA" ADD CONSTRAINT "CTA_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToTitle" ADD CONSTRAINT "_CategoryToTitle_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToTitle" ADD CONSTRAINT "_CategoryToTitle_B_fkey" FOREIGN KEY ("B") REFERENCES "Title"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostToCategory" ADD CONSTRAINT "_BlogPostToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostToCategory" ADD CONSTRAINT "_BlogPostToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
