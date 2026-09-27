-- CreateTable
CREATE TABLE "okrNguonKr" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "chiSo" TEXT,
    "phamVi" JSONB,
    "bac" TEXT,
    "sheetId" TEXT,
    "sheetO" TEXT,
    "docLuc" TIMESTAMP(3),
    "docGiaTri" DECIMAL(18,4),
    "docLoi" TEXT,
    "thuLuc" TIMESTAMP(3),
    "taoBoiUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrNguonKr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrSoChup" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "ngay" DATE NOT NULL,
    "giaTri" DECIMAL(18,4) NOT NULL,
    "nguon" TEXT NOT NULL,
    "chiSo" TEXT,
    "phamVi" JSONB,
    "bac" TEXT,
    "tacGiaUserId" TEXT,
    "chupLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrSoChup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "okrNguonKr_keyResultId_key" ON "okrNguonKr"("keyResultId");

-- CreateIndex
CREATE INDEX "okrNguonKr_loai_idx" ON "okrNguonKr"("loai");

-- CreateIndex
CREATE INDEX "okrSoChup_keyResultId_ngay_idx" ON "okrSoChup"("keyResultId", "ngay");

-- AddForeignKey
ALTER TABLE "okrNguonKr" ADD CONSTRAINT "okrNguonKr_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrSoChup" ADD CONSTRAINT "okrSoChup_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "okrSoChup_may_mot_ngay" ON "okrSoChup"("keyResultId", "ngay") WHERE ("nguon" IN ('crm', 'bang-tinh'));
