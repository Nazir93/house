-- CreateEnum
CREATE TYPE "Category" AS ENUM ('RESTAURANT', 'OFFICE', 'APARTMENT', 'SHOP', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ELECTRICAL', 'ACOUSTICS', 'STRUCTURED_CABLING', 'SMART_HOME', 'SECURITY', 'ARCHITECTURAL_LIGHTING');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConstructionMediaType" AS ENUM ('RENDER', 'PLAN', 'BUILD_STAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "BuiltObjectMaterial" AS ENUM ('GAS_BLOCK', 'BRICK', 'CERAMIC_BLOCK', 'FRAME', 'OTHER');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "service" "ServiceType" NOT NULL,
    "area" INTEGER,
    "description" TEXT NOT NULL,
    "seoDescription" TEXT,
    "coverImage" TEXT NOT NULL,
    "videoUrl" TEXT,
    "videoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT,
    "year" TEXT,
    "industry" TEXT,
    "projectType" TEXT,
    "features" TEXT,
    "goals" TEXT,
    "leftText1" TEXT,
    "rightText1" TEXT,
    "leftText2" TEXT,
    "rightText2" TEXT,
    "showcaseLabel1" TEXT,
    "showcaseLabel2" TEXT,
    "showcaseImage1" TEXT,
    "showcaseImage2" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "featuredOnHome" BOOLEAN NOT NULL DEFAULT false,
    "homeOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotspot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "xPercent" DOUBLE PRECISION NOT NULL,
    "yPercent" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Hotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseProject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "floors" INTEGER NOT NULL,
    "area" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "materials" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "pricePromo" TEXT,
    "mortgageEnabled" BOOLEAN NOT NULL DEFAULT true,
    "mortgageMode" TEXT NOT NULL DEFAULT 'LEAD',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "completionJson" JSONB,
    "constructionJson" JSONB,
    "anchorsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HouseProjectMedia" (
    "id" TEXT NOT NULL,
    "houseProjectId" TEXT NOT NULL,
    "type" "ConstructionMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "label" TEXT,
    "floor" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "HouseProjectMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuiltObject" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "material" "BuiltObjectMaterial" NOT NULL DEFAULT 'GAS_BLOCK',
    "area" INTEGER,
    "buildTerm" TEXT,
    "foundation" TEXT,
    "walls" TEXT,
    "roof" TEXT,
    "floors" INTEGER,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT NOT NULL,
    "worksDescription" TEXT,
    "telegramUrl" TEXT,
    "vkUrl" TEXT,
    "houseProjectId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuiltObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuiltObjectMedia" (
    "id" TEXT NOT NULL,
    "builtObjectId" TEXT NOT NULL,
    "type" "ConstructionMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "label" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BuiltObjectMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "service" TEXT,
    "pageUrl" TEXT,
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "calcData" JSONB,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "website" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "photoUrl" TEXT,
    "description" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorPhoto" TEXT,
    "objectName" TEXT,
    "service" "ServiceType",
    "rating" INTEGER NOT NULL DEFAULT 5,
    "text" TEXT NOT NULL,
    "videoUrl" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "service" "ServiceType",
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Администратор',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "coverImage" TEXT,
    "coverVideo" TEXT,
    "coverVideos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'zap',
    "coverImage" TEXT,
    "videoUrl" TEXT,
    "bannerImageDesktop" TEXT,
    "bannerImageMobile" TEXT,
    "landingJson" JSONB,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "permanent" BOOLEAN NOT NULL DEFAULT true,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redirect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referer" TEXT NOT NULL DEFAULT '',
    "userAgent" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageMeta" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "h1" TEXT,
    "bodyHtml" TEXT,
    "noindex" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PageMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ThankYouToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "leadName" TEXT,
    "source" TEXT,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThankYouToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_service_idx" ON "Project"("published", "service");

-- CreateIndex
CREATE INDEX "Project_published_category_idx" ON "Project"("published", "category");

-- CreateIndex
CREATE INDEX "Project_published_featuredOnHome_homeOrder_idx" ON "Project"("published", "featuredOnHome", "homeOrder");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_idx" ON "ProjectImage"("projectId");

-- CreateIndex
CREATE INDEX "Hotspot_projectId_idx" ON "Hotspot"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "HouseProject_slug_key" ON "HouseProject"("slug");

-- CreateIndex
CREATE INDEX "HouseProject_published_price_idx" ON "HouseProject"("published", "price");

-- CreateIndex
CREATE INDEX "HouseProject_published_area_idx" ON "HouseProject"("published", "area");

-- CreateIndex
CREATE INDEX "HouseProject_published_createdAt_idx" ON "HouseProject"("published", "createdAt");

-- CreateIndex
CREATE INDEX "HouseProjectMedia_houseProjectId_type_order_idx" ON "HouseProjectMedia"("houseProjectId", "type", "order");

-- CreateIndex
CREATE UNIQUE INDEX "BuiltObject_slug_key" ON "BuiltObject"("slug");

-- CreateIndex
CREATE INDEX "BuiltObject_published_material_idx" ON "BuiltObject"("published", "material");

-- CreateIndex
CREATE INDEX "BuiltObject_published_order_idx" ON "BuiltObject"("published", "order");

-- CreateIndex
CREATE INDEX "BuiltObject_houseProjectId_idx" ON "BuiltObject"("houseProjectId");

-- CreateIndex
CREATE INDEX "BuiltObjectMedia_builtObjectId_type_order_idx" ON "BuiltObjectMedia"("builtObjectId", "type", "order");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_service_idx" ON "Lead"("service");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_published_createdAt_idx" ON "Post"("published", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_published_order_idx" ON "Service"("published", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Redirect_fromPath_key" ON "Redirect"("fromPath");

-- CreateIndex
CREATE INDEX "Redirect_fromPath_idx" ON "Redirect"("fromPath");

-- CreateIndex
CREATE INDEX "ErrorLog_lastSeen_idx" ON "ErrorLog"("lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorLog_path_referer_key" ON "ErrorLog"("path", "referer");

-- CreateIndex
CREATE UNIQUE INDEX "PageMeta_path_key" ON "PageMeta"("path");

-- CreateIndex
CREATE INDEX "PageMeta_path_idx" ON "PageMeta"("path");

-- CreateIndex
CREATE UNIQUE INDEX "ThankYouToken_token_key" ON "ThankYouToken"("token");

-- CreateIndex
CREATE INDEX "ThankYouToken_token_idx" ON "ThankYouToken"("token");

-- CreateIndex
CREATE INDEX "ThankYouToken_expiresAt_idx" ON "ThankYouToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseProjectMedia" ADD CONSTRAINT "HouseProjectMedia_houseProjectId_fkey" FOREIGN KEY ("houseProjectId") REFERENCES "HouseProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuiltObject" ADD CONSTRAINT "BuiltObject_houseProjectId_fkey" FOREIGN KEY ("houseProjectId") REFERENCES "HouseProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuiltObjectMedia" ADD CONSTRAINT "BuiltObjectMedia_builtObjectId_fkey" FOREIGN KEY ("builtObjectId") REFERENCES "BuiltObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

