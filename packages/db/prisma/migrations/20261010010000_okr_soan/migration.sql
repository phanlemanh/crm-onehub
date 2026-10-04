-- AlterTable
ALTER TABLE "division" ADD COLUMN     "moTa" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "department" ADD COLUMN     "moTa" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "orgPlacement" ADD COLUMN     "chucDanh" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "okrProgramConfig" ADD COLUMN     "aiSoanAnDonVi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiSoanAnPhamVi" TEXT NOT NULL DEFAULT 'tat',
ADD COLUMN     "aiSoanDonVi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiSoanPhamVi" TEXT NOT NULL DEFAULT 'tat',
ADD COLUMN     "aiTranThangDatOkrUsd" DECIMAL(8,2);

-- AlterTable
ALTER TABLE "okrDeXuat" ADD COLUMN     "cuocSoanId" TEXT,
ADD COLUMN     "noiDung" JSONB,
ADD COLUMN     "taoRaId" TEXT;

-- CreateTable
CREATE TABLE "okrCuocSoan" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "divisionId" TEXT,
    "departmentId" TEXT,
    "nguoiMoUserId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cacPhien" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nac" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'dang',
    "soLuot" INTEGER NOT NULL DEFAULT 0,
    "streamIndex" INTEGER NOT NULL DEFAULT 0,
    "continuationToken" TEXT,
    "lanNopMoiNhat" TEXT,
    "daCat" JSONB,
    "duaVaoLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrCuocSoan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "okrCuocSoan_sessionId_key" ON "okrCuocSoan"("sessionId");

-- CreateIndex
CREATE INDEX "okrCuocSoan_cycleId_departmentId_idx" ON "okrCuocSoan"("cycleId", "departmentId");

-- CreateIndex
CREATE INDEX "okrCuocSoan_cycleId_divisionId_idx" ON "okrCuocSoan"("cycleId", "divisionId");

-- CreateIndex
CREATE INDEX "okrCuocSoan_nguoiMoUserId_idx" ON "okrCuocSoan"("nguoiMoUserId");

-- CreateIndex
CREATE INDEX "okrDeXuat_cuocSoanId_idx" ON "okrDeXuat"("cuocSoanId");
