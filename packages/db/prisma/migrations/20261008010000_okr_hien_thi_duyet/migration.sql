-- AlterTable
ALTER TABLE "okrProgramConfig" ADD COLUMN     "duyetCongBo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "okrObjective" ADD COLUMN     "hienThi" TEXT NOT NULL DEFAULT 'cong-khai';

-- CreateTable
CREATE TABLE "okrNguoiXem" (
    "objectiveId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrNguoiXem_pkey" PRIMARY KEY ("objectiveId","userId")
);

-- CreateIndex
CREATE INDEX "okrNguoiXem_userId_idx" ON "okrNguoiXem"("userId");

-- CreateIndex
CREATE INDEX "okrObjective_cycleId_hienThi_idx" ON "okrObjective"("cycleId", "hienThi");

-- AddForeignKey
ALTER TABLE "okrNguoiXem" ADD CONSTRAINT "okrNguoiXem_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrNguoiXem" ADD CONSTRAINT "okrNguoiXem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrNguoiXem" ADD CONSTRAINT "okrNguoiXem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
