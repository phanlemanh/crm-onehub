-- AlterTable
ALTER TABLE "taiLieuDeXuat" ADD COLUMN     "loai" TEXT NOT NULL DEFAULT 'NOI_DUNG',
ADD COLUMN     "lyDoDeXuat" TEXT,
ADD COLUMN     "tuPhienBanSo" INTEGER;

-- AlterTable
ALTER TABLE "taiLieuTrang" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "taiLieuTrang_archivedAt_idx" ON "taiLieuTrang"("archivedAt");
