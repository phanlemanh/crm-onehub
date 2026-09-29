-- AlterTable
ALTER TABLE "okrProgramConfig" ADD COLUMN     "aiDeXuatAnDonVi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiDeXuatAnPhamVi" TEXT NOT NULL DEFAULT 'tat',
ADD COLUMN     "aiTomTatAnDonVi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiTomTatAnPhamVi" TEXT NOT NULL DEFAULT 'tat';

-- AlterTable
ALTER TABLE "okrDeXuat" ADD COLUMN     "hienLuc" TIMESTAMP(3),
ADD COLUMN     "maLoai" TEXT,
ADD COLUMN     "nac" TEXT NOT NULL DEFAULT 'bat';

-- CreateIndex
CREATE INDEX "okrDeXuat_objectiveId_nac_trangThai_idx" ON "okrDeXuat"("objectiveId", "nac", "trangThai");
