-- CreateEnum
CREATE TYPE "TrangThaiViec" AS ENUM ('CHUA_LAM', 'DANG_LAM', 'CHO_DANH_GIA', 'XONG', 'HUY');

-- CreateTable
CREATE TABLE "viec" (
    "id" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "moTa" TEXT,
    "trangThai" "TrangThaiViec" NOT NULL DEFAULT 'CHUA_LAM',
    "hanNgay" TIMESTAMP(3),
    "nguoiGiaoId" TEXT NOT NULL,
    "nguoiThucHienId" TEXT NOT NULL,
    "taoBoiId" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doiLuc" TIMESTAMP(3) NOT NULL,
    "roiChuaLamLuc" TIMESTAMP(3),
    "khepLuc" TIMESTAMP(3),

    CONSTRAINT "viec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viecGan" (
    "id" TEXT NOT NULL,
    "viecId" TEXT NOT NULL,
    "companyId" TEXT,
    "contactId" TEXT,
    "dealId" TEXT,
    "planId" TEXT,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viecGan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viecTheoDoi" (
    "id" TEXT NOT NULL,
    "viecId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viecTheoDoi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viecVet" (
    "id" TEXT NOT NULL,
    "viecId" TEXT NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiId" TEXT,
    "loai" TEXT NOT NULL,
    "truoc" JSONB,
    "sau" JSONB,
    "nguon" TEXT NOT NULL,

    CONSTRAINT "viecVet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "viec_nguoiThucHienId_trangThai_hanNgay_idx" ON "viec"("nguoiThucHienId", "trangThai", "hanNgay");

-- CreateIndex
CREATE INDEX "viec_nguoiGiaoId_trangThai_idx" ON "viec"("nguoiGiaoId", "trangThai");

-- CreateIndex
CREATE INDEX "viec_taoLuc_idx" ON "viec"("taoLuc");

-- CreateIndex
CREATE INDEX "viecGan_companyId_idx" ON "viecGan"("companyId");

-- CreateIndex
CREATE INDEX "viecGan_contactId_idx" ON "viecGan"("contactId");

-- CreateIndex
CREATE INDEX "viecGan_dealId_idx" ON "viecGan"("dealId");

-- CreateIndex
CREATE INDEX "viecGan_planId_idx" ON "viecGan"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "viecGan_viecId_companyId_key" ON "viecGan"("viecId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "viecGan_viecId_contactId_key" ON "viecGan"("viecId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "viecGan_viecId_dealId_key" ON "viecGan"("viecId", "dealId");

-- CreateIndex
CREATE UNIQUE INDEX "viecGan_viecId_planId_key" ON "viecGan"("viecId", "planId");

-- CreateIndex
CREATE INDEX "viecTheoDoi_userId_idx" ON "viecTheoDoi"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "viecTheoDoi_viecId_userId_key" ON "viecTheoDoi"("viecId", "userId");

-- CreateIndex
CREATE INDEX "viecVet_viecId_luc_idx" ON "viecVet"("viecId", "luc");

-- CreateIndex
CREATE INDEX "viecVet_loai_idx" ON "viecVet"("loai");

-- AddForeignKey
ALTER TABLE "viec" ADD CONSTRAINT "viec_nguoiGiaoId_fkey" FOREIGN KEY ("nguoiGiaoId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viec" ADD CONSTRAINT "viec_nguoiThucHienId_fkey" FOREIGN KEY ("nguoiThucHienId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viec" ADD CONSTRAINT "viec_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecGan" ADD CONSTRAINT "viecGan_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecGan" ADD CONSTRAINT "viecGan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecGan" ADD CONSTRAINT "viecGan_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecGan" ADD CONSTRAINT "viecGan_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecGan" ADD CONSTRAINT "viecGan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecTheoDoi" ADD CONSTRAINT "viecTheoDoi_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecTheoDoi" ADD CONSTRAINT "viecTheoDoi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecVet" ADD CONSTRAINT "viecVet_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecVet" ADD CONSTRAINT "viecVet_nguoiId_fkey" FOREIGN KEY ("nguoiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "viecGan" ADD CONSTRAINT "viecGan_dung_mot_ban_ghi" CHECK (num_nonnulls("companyId", "contactId", "dealId", "planId") = 1);
