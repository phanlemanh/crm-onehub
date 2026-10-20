-- CreateTable
CREATE TABLE "chiPhiAds" (
    "id" TEXT NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL,
    "nenTang" TEXT NOT NULL,
    "accountId" TEXT NOT NULL DEFAULT '',
    "campaignId" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL DEFAULT '',
    "spend" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3),
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doiLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chiPhiAds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chiPhiAds_ngay_nenTang_campaignId_key" ON "chiPhiAds"("ngay", "nenTang", "campaignId");

-- CreateIndex
CREATE INDEX "chiPhiAds_nenTang_ngay_idx" ON "chiPhiAds"("nenTang", "ngay");
