
-- CreateEnum
CREATE TYPE "TrangThaiGoiY" AS ENUM ('CHO', 'DA_MO', 'BO_QUA');

-- CreateTable
CREATE TABLE "goiYKeHoach" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nguoiNhanId" TEXT NOT NULL,
    "chuyenLuc" TIMESTAMP(3) NOT NULL,
    "trangThai" "TrangThaiGoiY" NOT NULL DEFAULT 'CHO',
    "sinhLuc" TIMESTAMP(3) NOT NULL,
    "xuLyLuc" TIMESTAMP(3),
    "xuLyBoiId" TEXT,
    "planId" TEXT,

    CONSTRAINT "goiYKeHoach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goiYKeHoach_dealId_trangThai_idx" ON "goiYKeHoach"("dealId", "trangThai");

-- CreateIndex
CREATE INDEX "goiYKeHoach_nguoiNhanId_trangThai_idx" ON "goiYKeHoach"("nguoiNhanId", "trangThai");

-- CreateIndex
CREATE INDEX "goiYKeHoach_companyId_trangThai_idx" ON "goiYKeHoach"("companyId", "trangThai");

-- CreateIndex
CREATE INDEX "goiYKeHoach_sinhLuc_idx" ON "goiYKeHoach"("sinhLuc");

-- CreateIndex
CREATE UNIQUE INDEX "goiYKeHoach_dealId_cho_key" ON "goiYKeHoach"("dealId") WHERE ("trangThai" = 'CHO');

-- AddForeignKey
ALTER TABLE "goiYKeHoach" ADD CONSTRAINT "goiYKeHoach_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goiYKeHoach" ADD CONSTRAINT "goiYKeHoach_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goiYKeHoach" ADD CONSTRAINT "goiYKeHoach_nguoiNhanId_fkey" FOREIGN KEY ("nguoiNhanId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goiYKeHoach" ADD CONSTRAINT "goiYKeHoach_xuLyBoiId_fkey" FOREIGN KEY ("xuLyBoiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goiYKeHoach" ADD CONSTRAINT "goiYKeHoach_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

