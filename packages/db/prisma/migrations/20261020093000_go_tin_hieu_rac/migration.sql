-- AlterTable
ALTER TABLE "tinHieu" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedById" TEXT;

-- CreateTable
CREATE TABLE "tinHieuVet" (
    "id" TEXT NOT NULL,
    "tinHieuId" TEXT,
    "so" INTEGER NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiId" TEXT,
    "loai" TEXT NOT NULL,

    CONSTRAINT "tinHieuVet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tinHieuVet_tinHieuId_luc_idx" ON "tinHieuVet"("tinHieuId", "luc");

-- AddForeignKey
ALTER TABLE "tinHieu" ADD CONSTRAINT "tinHieu_archivedById_fkey" FOREIGN KEY ("archivedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tinHieuVet" ADD CONSTRAINT "tinHieuVet_tinHieuId_fkey" FOREIGN KEY ("tinHieuId") REFERENCES "tinHieu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tinHieuVet" ADD CONSTRAINT "tinHieuVet_nguoiId_fkey" FOREIGN KEY ("nguoiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

