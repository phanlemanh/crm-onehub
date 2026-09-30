-- CreateTable
CREATE TABLE "okrHoiY" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "cauHoi" TEXT NOT NULL,
    "loiMo" TEXT NOT NULL DEFAULT '',
    "soLieu" JSONB NOT NULL,
    "hanLuc" TIMESTAMP(3) NOT NULL,
    "nguoiChonUserId" TEXT NOT NULL,
    "taoBoiUserId" TEXT NOT NULL,
    "congBoLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrHoiY_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrHoiYBanTruoc" (
    "id" TEXT NOT NULL,
    "hoiYId" TEXT NOT NULL,
    "cau" TEXT[],
    "boQua" BOOLEAN NOT NULL,
    "vietBoiUserId" TEXT NOT NULL,
    "niemPhongLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrHoiYBanTruoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrY" (
    "id" TEXT NOT NULL,
    "hoiYId" TEXT NOT NULL,
    "tacGiaUserId" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "viSao" TEXT NOT NULL DEFAULT '',
    "doBangGi" TEXT NOT NULL DEFAULT '',
    "chuDeId" TEXT,
    "ganLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrY_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrYDongY" (
    "yId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrYDongY_pkey" PRIMARY KEY ("yId","userId")
);

-- CreateTable
CREATE TABLE "okrChuDe" (
    "id" TEXT NOT NULL,
    "hoiYId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "ketLuan" TEXT,
    "lyDo" TEXT NOT NULL DEFAULT '',
    "cauMucTieu" TEXT NOT NULL DEFAULT '',
    "noiBanTruoc" TEXT,
    "objectiveId" TEXT,
    "viTri" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrChuDe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrHoiYHieu" (
    "hoiYId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrHoiYHieu_pkey" PRIMARY KEY ("hoiYId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "okrHoiY_cycleId_key" ON "okrHoiY"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "okrHoiYBanTruoc_hoiYId_key" ON "okrHoiYBanTruoc"("hoiYId");

-- CreateIndex
CREATE INDEX "okrY_hoiYId_tacGiaUserId_idx" ON "okrY"("hoiYId", "tacGiaUserId");

-- CreateIndex
CREATE INDEX "okrY_chuDeId_idx" ON "okrY"("chuDeId");

-- CreateIndex
CREATE UNIQUE INDEX "okrChuDe_objectiveId_key" ON "okrChuDe"("objectiveId");

-- CreateIndex
CREATE INDEX "okrChuDe_hoiYId_idx" ON "okrChuDe"("hoiYId");

-- AddForeignKey
ALTER TABLE "okrHoiY" ADD CONSTRAINT "okrHoiY_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrHoiY" ADD CONSTRAINT "okrHoiY_nguoiChonUserId_fkey" FOREIGN KEY ("nguoiChonUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrHoiY" ADD CONSTRAINT "okrHoiY_taoBoiUserId_fkey" FOREIGN KEY ("taoBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrHoiYBanTruoc" ADD CONSTRAINT "okrHoiYBanTruoc_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrHoiYBanTruoc" ADD CONSTRAINT "okrHoiYBanTruoc_vietBoiUserId_fkey" FOREIGN KEY ("vietBoiUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrY" ADD CONSTRAINT "okrY_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrY" ADD CONSTRAINT "okrY_tacGiaUserId_fkey" FOREIGN KEY ("tacGiaUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrY" ADD CONSTRAINT "okrY_chuDeId_fkey" FOREIGN KEY ("chuDeId") REFERENCES "okrChuDe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrYDongY" ADD CONSTRAINT "okrYDongY_yId_fkey" FOREIGN KEY ("yId") REFERENCES "okrY"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrYDongY" ADD CONSTRAINT "okrYDongY_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrChuDe" ADD CONSTRAINT "okrChuDe_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrChuDe" ADD CONSTRAINT "okrChuDe_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrHoiYHieu" ADD CONSTRAINT "okrHoiYHieu_hoiYId_fkey" FOREIGN KEY ("hoiYId") REFERENCES "okrHoiY"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrHoiYHieu" ADD CONSTRAINT "okrHoiYHieu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
