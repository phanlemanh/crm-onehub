-- AlterTable
ALTER TABLE "notificationPreference" ADD COLUMN     "dongTroLyOkr" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "okrProgramConfig" ADD COLUMN     "aiDeXuatDonVi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiDeXuatPhamVi" TEXT NOT NULL DEFAULT 'tat',
ADD COLUMN     "aiOn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiTomTatDonVi" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiTomTatPhamVi" TEXT NOT NULL DEFAULT 'tat',
ADD COLUMN     "aiTranThangUsd" DECIMAL(8,2) NOT NULL DEFAULT 9;

-- CreateTable
CREATE TABLE "okrDeXuat" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "keyResultId" TEXT,
    "loai" TEXT NOT NULL,
    "truong" TEXT,
    "truoc" TEXT,
    "sau" TEXT,
    "sauChuan" TEXT,
    "maVanDe" TEXT,
    "dich" JSONB,
    "lyDo" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'cho',
    "giaTriCuoi" TEXT,
    "inputHash" TEXT NOT NULL,
    "nguoiYeuCau" TEXT NOT NULL,
    "nguoiQuyet" TEXT,
    "quyetLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrDeXuat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrTomTat" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "tuan" DATE NOT NULL,
    "cau" JSONB NOT NULL,
    "soCauBo" INTEGER NOT NULL,
    "trangThai" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrTomTat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrTomTatPhanHoi" (
    "id" TEXT NOT NULL,
    "tomTatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "huuIch" BOOLEAN NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrTomTatPhanHoi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aiChiPhi" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "phienCha" TEXT,
    "kenh" TEXT,
    "tinhNang" TEXT NOT NULL,
    "taskId" TEXT,
    "modelId" TEXT,
    "inputTokens" INTEGER,
    "cacheReadTokens" INTEGER,
    "outputTokens" INTEGER,
    "costUsd" DECIMAL(12,6),

    CONSTRAINT "aiChiPhi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aiDoiSoat" (
    "thang" TEXT NOT NULL,
    "tuNgay" DATE NOT NULL,
    "denNgay" DATE NOT NULL,
    "soSoUsd" DECIMAL(12,6) NOT NULL,
    "soGatewayUsd" DECIMAL(12,6),
    "lechPhanTram" DECIMAL(6,1),
    "ketQua" TEXT NOT NULL,
    "lyDo" TEXT,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aiDoiSoat_pkey" PRIMARY KEY ("thang")
);

-- CreateTable
CREATE TABLE "aiBaoTran" (
    "thang" TEXT NOT NULL,
    "muc" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aiBaoTran_pkey" PRIMARY KEY ("thang","muc","userId")
);

-- CreateIndex
CREATE INDEX "okrDeXuat_objectiveId_trangThai_idx" ON "okrDeXuat"("objectiveId", "trangThai");

-- CreateIndex
CREATE INDEX "okrDeXuat_taskId_idx" ON "okrDeXuat"("taskId");

-- CreateIndex
CREATE INDEX "okrDeXuat_createdAt_idx" ON "okrDeXuat"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "okrTomTat_taskId_key" ON "okrTomTat"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "okrTomTat_cycleId_departmentId_tuan_key" ON "okrTomTat"("cycleId", "departmentId", "tuan");

-- CreateIndex
CREATE UNIQUE INDEX "okrTomTatPhanHoi_tomTatId_userId_key" ON "okrTomTatPhanHoi"("tomTatId", "userId");

-- CreateIndex
CREATE INDEX "aiChiPhi_at_idx" ON "aiChiPhi"("at");

-- CreateIndex
CREATE INDEX "aiChiPhi_tinhNang_at_idx" ON "aiChiPhi"("tinhNang", "at");

-- CreateIndex
CREATE INDEX "aiChiPhi_sessionId_idx" ON "aiChiPhi"("sessionId");

