-- AlterTable
ALTER TABLE "appSetting" ADD COLUMN     "ngayNghiTuan" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- AlterTable
ALTER TABLE "viec" ADD COLUMN     "batDauNgay" TIMESTAMP(3),
ADD COLUMN     "duAnId" TEXT;

-- CreateTable
CREATE TABLE "duAn" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "taoBoiId" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doiLuc" TIMESTAMP(3) NOT NULL,
    "dongLuc" TIMESTAMP(3),
    "dongBoiId" TEXT,

    CONSTRAINT "duAn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duAnVet" (
    "id" TEXT NOT NULL,
    "duAnId" TEXT NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nguoiId" TEXT,
    "loai" TEXT NOT NULL,
    "truoc" JSONB,
    "sau" JSONB,

    CONSTRAINT "duAnVet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duAnMoc" (
    "id" TEXT NOT NULL,
    "duAnId" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL,
    "taoBoiId" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duAnMoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duAnMocCho" (
    "id" TEXT NOT NULL,
    "mocId" TEXT NOT NULL,
    "viecId" TEXT NOT NULL,

    CONSTRAINT "duAnMocCho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viecPhuThuoc" (
    "id" TEXT NOT NULL,
    "truocId" TEXT NOT NULL,
    "sauId" TEXT NOT NULL,
    "taoBoiId" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viecPhuThuoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ngayNghi" (
    "id" TEXT NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL,
    "ten" TEXT NOT NULL,
    "taoBoiId" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ngayNghi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "duAn_dongLuc_idx" ON "duAn"("dongLuc");

-- CreateIndex
CREATE INDEX "duAn_taoLuc_idx" ON "duAn"("taoLuc");

-- CreateIndex
CREATE INDEX "duAnVet_duAnId_luc_idx" ON "duAnVet"("duAnId", "luc");

-- CreateIndex
CREATE INDEX "duAnMoc_duAnId_ngay_idx" ON "duAnMoc"("duAnId", "ngay");

-- CreateIndex
CREATE INDEX "duAnMocCho_viecId_idx" ON "duAnMocCho"("viecId");

-- CreateIndex
CREATE UNIQUE INDEX "duAnMocCho_mocId_viecId_key" ON "duAnMocCho"("mocId", "viecId");

-- CreateIndex
CREATE INDEX "viecPhuThuoc_sauId_idx" ON "viecPhuThuoc"("sauId");

-- CreateIndex
CREATE UNIQUE INDEX "viecPhuThuoc_truocId_sauId_key" ON "viecPhuThuoc"("truocId", "sauId");

-- CreateIndex
CREATE UNIQUE INDEX "ngayNghi_ngay_key" ON "ngayNghi"("ngay");

-- CreateIndex
CREATE INDEX "viec_duAnId_idx" ON "viec"("duAnId");

-- AddForeignKey
ALTER TABLE "viec" ADD CONSTRAINT "viec_duAnId_fkey" FOREIGN KEY ("duAnId") REFERENCES "duAn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAn" ADD CONSTRAINT "duAn_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAn" ADD CONSTRAINT "duAn_dongBoiId_fkey" FOREIGN KEY ("dongBoiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAnVet" ADD CONSTRAINT "duAnVet_duAnId_fkey" FOREIGN KEY ("duAnId") REFERENCES "duAn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAnVet" ADD CONSTRAINT "duAnVet_nguoiId_fkey" FOREIGN KEY ("nguoiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAnMoc" ADD CONSTRAINT "duAnMoc_duAnId_fkey" FOREIGN KEY ("duAnId") REFERENCES "duAn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAnMoc" ADD CONSTRAINT "duAnMoc_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAnMocCho" ADD CONSTRAINT "duAnMocCho_mocId_fkey" FOREIGN KEY ("mocId") REFERENCES "duAnMoc"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duAnMocCho" ADD CONSTRAINT "duAnMocCho_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecPhuThuoc" ADD CONSTRAINT "viecPhuThuoc_truocId_fkey" FOREIGN KEY ("truocId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecPhuThuoc" ADD CONSTRAINT "viecPhuThuoc_sauId_fkey" FOREIGN KEY ("sauId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecPhuThuoc" ADD CONSTRAINT "viecPhuThuoc_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ngayNghi" ADD CONSTRAINT "ngayNghi_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
