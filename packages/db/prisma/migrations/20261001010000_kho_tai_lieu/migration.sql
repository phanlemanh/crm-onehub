-- CreateExtension
CREATE EXTENSION IF NOT EXISTS unaccent;

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateTable
CREATE TABLE "taiLieuTrang" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "departmentId" TEXT,
    "chuTrangId" TEXT NOT NULL,
    "xacMinhDen" TIMESTAMP(3),
    "banDangDungId" TEXT,
    "timKiem" tsvector,
    "taoBoiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taiLieuTrang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taiLieuPhienBan" (
    "id" TEXT NOT NULL,
    "trangId" TEXT NOT NULL,
    "so" INTEGER NOT NULL,
    "ten" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "noiDungHash" TEXT NOT NULL,
    "deXuatId" TEXT NOT NULL,
    "duyetBoiId" TEXT NOT NULL,
    "duyetLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taiLieuPhienBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taiLieuDeXuat" (
    "id" TEXT NOT NULL,
    "trangId" TEXT NOT NULL,
    "banGocId" TEXT,
    "ten" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "taoBoiId" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'CHO_DUYET',
    "lyDo" TEXT,
    "xuLyBoiId" TEXT,
    "xuLyLuc" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taiLieuDeXuat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taiLieuSuKien" (
    "id" TEXT NOT NULL,
    "trangId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "aiId" TEXT NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chiTiet" JSONB NOT NULL,

    CONSTRAINT "taiLieuSuKien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taiLieuLienKet" (
    "id" TEXT NOT NULL,
    "tuTrangId" TEXT NOT NULL,
    "denSlug" TEXT NOT NULL,
    "vanBan" TEXT NOT NULL,

    CONSTRAINT "taiLieuLienKet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuTrang_slug_key" ON "taiLieuTrang"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuTrang_banDangDungId_key" ON "taiLieuTrang"("banDangDungId");

-- CreateIndex
CREATE INDEX "taiLieuTrang_loai_idx" ON "taiLieuTrang"("loai");

-- CreateIndex
CREATE INDEX "taiLieuTrang_chuTrangId_idx" ON "taiLieuTrang"("chuTrangId");

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuPhienBan_deXuatId_key" ON "taiLieuPhienBan"("deXuatId");

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuPhienBan_trangId_so_key" ON "taiLieuPhienBan"("trangId", "so");

-- CreateIndex
CREATE INDEX "taiLieuDeXuat_trangId_trangThai_idx" ON "taiLieuDeXuat"("trangId", "trangThai");

-- CreateIndex
CREATE INDEX "taiLieuSuKien_trangId_luc_idx" ON "taiLieuSuKien"("trangId", "luc");

-- CreateIndex
CREATE INDEX "taiLieuLienKet_denSlug_idx" ON "taiLieuLienKet"("denSlug");

-- CreateIndex
CREATE INDEX "taiLieuLienKet_tuTrangId_idx" ON "taiLieuLienKet"("tuTrangId");

-- CreateIndex
CREATE INDEX "taiLieuTrang_timKiem_idx" ON "taiLieuTrang" USING GIN ("timKiem");

-- AddForeignKey
ALTER TABLE "taiLieuTrang" ADD CONSTRAINT "taiLieuTrang_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuTrang" ADD CONSTRAINT "taiLieuTrang_chuTrangId_fkey" FOREIGN KEY ("chuTrangId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuTrang" ADD CONSTRAINT "taiLieuTrang_banDangDungId_fkey" FOREIGN KEY ("banDangDungId") REFERENCES "taiLieuPhienBan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuTrang" ADD CONSTRAINT "taiLieuTrang_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuPhienBan" ADD CONSTRAINT "taiLieuPhienBan_trangId_fkey" FOREIGN KEY ("trangId") REFERENCES "taiLieuTrang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuPhienBan" ADD CONSTRAINT "taiLieuPhienBan_deXuatId_fkey" FOREIGN KEY ("deXuatId") REFERENCES "taiLieuDeXuat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuPhienBan" ADD CONSTRAINT "taiLieuPhienBan_duyetBoiId_fkey" FOREIGN KEY ("duyetBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuDeXuat" ADD CONSTRAINT "taiLieuDeXuat_trangId_fkey" FOREIGN KEY ("trangId") REFERENCES "taiLieuTrang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuDeXuat" ADD CONSTRAINT "taiLieuDeXuat_banGocId_fkey" FOREIGN KEY ("banGocId") REFERENCES "taiLieuPhienBan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuDeXuat" ADD CONSTRAINT "taiLieuDeXuat_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuDeXuat" ADD CONSTRAINT "taiLieuDeXuat_xuLyBoiId_fkey" FOREIGN KEY ("xuLyBoiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuSuKien" ADD CONSTRAINT "taiLieuSuKien_trangId_fkey" FOREIGN KEY ("trangId") REFERENCES "taiLieuTrang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuSuKien" ADD CONSTRAINT "taiLieuSuKien_aiId_fkey" FOREIGN KEY ("aiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuLienKet" ADD CONSTRAINT "taiLieuLienKet_tuTrangId_fkey" FOREIGN KEY ("tuTrangId") REFERENCES "taiLieuTrang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

