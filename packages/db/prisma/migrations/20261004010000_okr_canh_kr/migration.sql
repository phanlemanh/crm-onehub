-- CreateTable
CREATE TABLE "okrViecKr" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL DEFAULT '',
    "nguoiLamUserId" TEXT,
    "hanNgay" DATE,
    "xongLuc" TIMESTAMP(3),
    "campaignId" TEXT,
    "planId" TEXT,
    "taoBoiUserId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrViecKr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrBangChung" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ghiChu" TEXT NOT NULL DEFAULT '',
    "tacGiaUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrBangChung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrGhiNhan" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "keyResultId" TEXT,
    "loiNhan" TEXT NOT NULL,
    "tacGiaUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrGhiNhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrGhiNhanNhan" (
    "ghiNhanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "okrGhiNhanNhan_pkey" PRIMARY KEY ("ghiNhanId","userId")
);

-- CreateTable
CREATE TABLE "okrMau" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "cap" TEXT NOT NULL,
    "donViIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "noiDung" JSONB NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "taoBoiUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrMau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrMucTieuTuMau" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "mauId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrMucTieuTuMau_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "okrViecKr_keyResultId_position_idx" ON "okrViecKr"("keyResultId", "position");

-- CreateIndex
CREATE INDEX "okrViecKr_nguoiLamUserId_idx" ON "okrViecKr"("nguoiLamUserId");

-- CreateIndex
CREATE UNIQUE INDEX "okrViecKr_keyResultId_campaignId_key" ON "okrViecKr"("keyResultId", "campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "okrViecKr_keyResultId_planId_key" ON "okrViecKr"("keyResultId", "planId");

-- CreateIndex
CREATE INDEX "okrBangChung_keyResultId_createdAt_idx" ON "okrBangChung"("keyResultId", "createdAt");

-- CreateIndex
CREATE INDEX "okrGhiNhan_objectiveId_createdAt_idx" ON "okrGhiNhan"("objectiveId", "createdAt");

-- CreateIndex
CREATE INDEX "okrGhiNhan_createdAt_idx" ON "okrGhiNhan"("createdAt");

-- CreateIndex
CREATE INDEX "okrGhiNhanNhan_userId_idx" ON "okrGhiNhanNhan"("userId");

-- CreateIndex
CREATE INDEX "okrMau_cap_archivedAt_idx" ON "okrMau"("cap", "archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "okrMucTieuTuMau_objectiveId_key" ON "okrMucTieuTuMau"("objectiveId");

-- CreateIndex
CREATE INDEX "okrMucTieuTuMau_mauId_idx" ON "okrMucTieuTuMau"("mauId");

-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_nguoiLamUserId_fkey" FOREIGN KEY ("nguoiLamUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrViecKr" ADD CONSTRAINT "okrViecKr_taoBoiUserId_fkey" FOREIGN KEY ("taoBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrBangChung" ADD CONSTRAINT "okrBangChung_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrBangChung" ADD CONSTRAINT "okrBangChung_tacGiaUserId_fkey" FOREIGN KEY ("tacGiaUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrGhiNhan" ADD CONSTRAINT "okrGhiNhan_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrGhiNhan" ADD CONSTRAINT "okrGhiNhan_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrGhiNhan" ADD CONSTRAINT "okrGhiNhan_tacGiaUserId_fkey" FOREIGN KEY ("tacGiaUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrGhiNhanNhan" ADD CONSTRAINT "okrGhiNhanNhan_ghiNhanId_fkey" FOREIGN KEY ("ghiNhanId") REFERENCES "okrGhiNhan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrGhiNhanNhan" ADD CONSTRAINT "okrGhiNhanNhan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrMau" ADD CONSTRAINT "okrMau_taoBoiUserId_fkey" FOREIGN KEY ("taoBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrMucTieuTuMau" ADD CONSTRAINT "okrMucTieuTuMau_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrMucTieuTuMau" ADD CONSTRAINT "okrMucTieuTuMau_mauId_fkey" FOREIGN KEY ("mauId") REFERENCES "okrMau"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

