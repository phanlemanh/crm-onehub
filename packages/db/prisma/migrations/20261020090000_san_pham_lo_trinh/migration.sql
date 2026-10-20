-- CreateTable
CREATE TABLE "SanPhamLoTrinh" (
    "ma" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "kho" TEXT NOT NULL,
    "nhanh" TEXT NOT NULL,
    "duongTep" TEXT NOT NULL,
    "trangThaiLay" TEXT NOT NULL DEFAULT 'chua-lay',
    "chiTietLay" TEXT,
    "kiemLuc" TIMESTAMP(3),
    "layDauLuc" TIMESTAMP(3),
    "caiLuc" TIMESTAMP(3),
    "nguonDoiLuc" TIMESTAMP(3),
    "phienBanKhuon" INTEGER,
    "luuTruLuc" TIMESTAMP(3),
    "taoBoiId" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doiLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SanPhamLoTrinh_pkey" PRIMARY KEY ("ma")
);

-- CreateTable
CREATE TABLE "SanPhamNguoiXem" (
    "sanPhamMa" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "capLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SanPhamNguoiXem_pkey" PRIMARY KEY ("sanPhamMa","userId")
);

-- CreateIndex
CREATE INDEX "SanPhamLoTrinh_luuTruLuc_kiemLuc_idx" ON "SanPhamLoTrinh"("luuTruLuc", "kiemLuc");

-- CreateIndex
CREATE INDEX "SanPhamNguoiXem_userId_idx" ON "SanPhamNguoiXem"("userId");

-- AddForeignKey
ALTER TABLE "SanPhamLoTrinh" ADD CONSTRAINT "SanPhamLoTrinh_taoBoiId_fkey" FOREIGN KEY ("taoBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanPhamNguoiXem" ADD CONSTRAINT "SanPhamNguoiXem_sanPhamMa_fkey" FOREIGN KEY ("sanPhamMa") REFERENCES "SanPhamLoTrinh"("ma") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SanPhamNguoiXem" ADD CONSTRAINT "SanPhamNguoiXem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

