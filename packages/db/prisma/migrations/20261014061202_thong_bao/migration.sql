-- CreateTable
CREATE TABLE "thongBao" (
    "id" TEXT NOT NULL,
    "nguoiNhanId" TEXT NOT NULL,
    "nguon" TEXT NOT NULL,
    "khoa" TEXT NOT NULL,
    "noiDung" JSONB NOT NULL,
    "duongDan" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ngayDau" TEXT NOT NULL,
    "thayNgay" TEXT NOT NULL,
    "docLuc" TIMESTAMP(3),
    "moLuc" TIMESTAMP(3),

    CONSTRAINT "thongBao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "thongBao_nguoiNhanId_taoLuc_idx" ON "thongBao"("nguoiNhanId", "taoLuc");

-- CreateIndex
CREATE INDEX "thongBao_nguoiNhanId_docLuc_idx" ON "thongBao"("nguoiNhanId", "docLuc");

-- CreateIndex
CREATE INDEX "thongBao_taoLuc_idx" ON "thongBao"("taoLuc");

-- CreateIndex
CREATE UNIQUE INDEX "thongBao_nguoiNhanId_khoa_ngayDau_key" ON "thongBao"("nguoiNhanId", "khoa", "ngayDau");

-- AddForeignKey
ALTER TABLE "thongBao" ADD CONSTRAINT "thongBao_nguoiNhanId_fkey" FOREIGN KEY ("nguoiNhanId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

