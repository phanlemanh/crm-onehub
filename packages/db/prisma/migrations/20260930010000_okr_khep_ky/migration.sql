-- CreateTable
CREATE TABLE "okrCuaSoRa" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "tuNgay" DATE NOT NULL,
    "denNgay" DATE NOT NULL,
    "moBoiUserId" TEXT NOT NULL,
    "dongLuc" TIMESTAMP(3),
    "dongBoiUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrCuaSoRa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrDoiDich" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "truoc" DECIMAL(18,4) NOT NULL,
    "sau" DECIMAL(18,4) NOT NULL,
    "lyDo" TEXT NOT NULL DEFAULT '',
    "ngoaiRa" BOOLEAN NOT NULL,
    "cuaSoRaId" TEXT,
    "tacGiaUserId" TEXT NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrDoiDich_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrDiemKr" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "soChot" DECIMAL(18,4) NOT NULL,
    "diemGoiY" DECIMAL(3,2) NOT NULL,
    "diem" DECIMAL(3,2),
    "lyDo" TEXT,
    "thang" TEXT NOT NULL,
    "trongSoBat" BOOLEAN NOT NULL,
    "phienBanChuongTrinh" INTEGER NOT NULL,
    "chamBoiUserId" TEXT,
    "chamLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrDiemKr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrNhinLai" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "dieuHocDuoc" TEXT NOT NULL,
    "suaBoiUserId" TEXT NOT NULL,
    "suaLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrNhinLai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrMangSang" (
    "id" TEXT NOT NULL,
    "tuObjectiveId" TEXT NOT NULL,
    "sangObjectiveId" TEXT NOT NULL,
    "sangCycleId" TEXT NOT NULL,
    "boiUserId" TEXT NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrMangSang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "okrCuaSoRa_cycleId_idx" ON "okrCuaSoRa"("cycleId");

-- CreateIndex
CREATE INDEX "okrDoiDich_keyResultId_luc_idx" ON "okrDoiDich"("keyResultId", "luc");

-- CreateIndex
CREATE UNIQUE INDEX "okrDiemKr_keyResultId_key" ON "okrDiemKr"("keyResultId");

-- CreateIndex
CREATE INDEX "okrDiemKr_cycleId_idx" ON "okrDiemKr"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "okrNhinLai_objectiveId_key" ON "okrNhinLai"("objectiveId");

-- CreateIndex
CREATE UNIQUE INDEX "okrMangSang_sangObjectiveId_key" ON "okrMangSang"("sangObjectiveId");

-- CreateIndex
CREATE UNIQUE INDEX "okrMangSang_tuObjectiveId_sangCycleId_key" ON "okrMangSang"("tuObjectiveId", "sangCycleId");

-- AddForeignKey
ALTER TABLE "okrCuaSoRa" ADD CONSTRAINT "okrCuaSoRa_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrDoiDich" ADD CONSTRAINT "okrDoiDich_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrDoiDich" ADD CONSTRAINT "okrDoiDich_cuaSoRaId_fkey" FOREIGN KEY ("cuaSoRaId") REFERENCES "okrCuaSoRa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrDiemKr" ADD CONSTRAINT "okrDiemKr_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrDiemKr" ADD CONSTRAINT "okrDiemKr_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrNhinLai" ADD CONSTRAINT "okrNhinLai_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrMangSang" ADD CONSTRAINT "okrMangSang_tuObjectiveId_fkey" FOREIGN KEY ("tuObjectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrMangSang" ADD CONSTRAINT "okrMangSang_sangObjectiveId_fkey" FOREIGN KEY ("sangObjectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrMangSang" ADD CONSTRAINT "okrMangSang_sangCycleId_fkey" FOREIGN KEY ("sangCycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
