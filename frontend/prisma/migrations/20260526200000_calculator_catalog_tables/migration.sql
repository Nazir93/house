-- CreateTable
CREATE TABLE "calculator_category" (
    "id" TEXT NOT NULL,
    "labelRu" TEXT NOT NULL,
    "floors" DOUBLE PRECISION NOT NULL,
    "roofType" TEXT NOT NULL,
    "facadeCoef" DOUBLE PRECISION NOT NULL,
    "perimeterCoef" DOUBLE PRECISION NOT NULL,
    "roofCoef" DOUBLE PRECISION NOT NULL,
    "soffitCoef" DOUBLE PRECISION NOT NULL,
    "gutterCoef" DOUBLE PRECISION NOT NULL,
    "overlapCoef" DOUBLE PRECISION NOT NULL,
    "insulationCoef" DOUBLE PRECISION NOT NULL,
    "crossCoef" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "calculator_category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "calculator_shell_price" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "wallMaterial" TEXT NOT NULL,
    "pricePerM2" INTEGER NOT NULL,

    CONSTRAINT "calculator_shell_price_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "calculator_facade_type" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pricePerM2" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "calculator_facade_type_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "calculator_option" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupSlug" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "pricePerUnit" INTEGER NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "allowedCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "calculator_option_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "calculator_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "smallAreaThresholdM2" INTEGER NOT NULL DEFAULT 100,
    "smallAreaSurcharge" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "addonsSurchargeUnderThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "blindAreaWidthM" DOUBLE PRECISION NOT NULL DEFAULT 0.8,

    CONSTRAINT "calculator_settings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "HouseProject" ADD COLUMN IF NOT EXISTS "calculatorOptionOverrides" JSONB;

CREATE UNIQUE INDEX "calculator_shell_price_categoryId_wallMaterial_key" ON "calculator_shell_price"("categoryId", "wallMaterial");
CREATE UNIQUE INDEX "calculator_facade_type_slug_key" ON "calculator_facade_type"("slug");
CREATE UNIQUE INDEX "calculator_option_slug_key" ON "calculator_option"("slug");
CREATE INDEX "calculator_option_groupSlug_isActive_idx" ON "calculator_option"("groupSlug", "isActive");

ALTER TABLE "calculator_shell_price" ADD CONSTRAINT "calculator_shell_price_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "calculator_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
