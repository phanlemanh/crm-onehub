-- CreateTable
CREATE TABLE "taiLieuHoi" (
    "id" TEXT NOT NULL,
    "nguoiHoiId" TEXT NOT NULL,
    "kenh" TEXT NOT NULL,
    "zaloHoiId" TEXT,
    "phienId" TEXT,
    "cauHoi" TEXT,
    "trangThai" TEXT NOT NULL DEFAULT 'DANG_HOI',
    "lyDo" TEXT,
    "traLoi" JSONB,
    "ganNhat" JSONB,
    "hoiLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xongLuc" TIMESTAMP(3),
    "tokenVao" INTEGER NOT NULL DEFAULT 0,
    "tokenRa" INTEGER NOT NULL DEFAULT 0,
    "chiPhiUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "soLanBac" INTEGER NOT NULL DEFAULT 0,
    "nhanKhoa" TEXT,
    "xuLyLuc" TIMESTAMP(3),
    "xuLyBoiId" TEXT,

    CONSTRAINT "taiLieuHoi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taiLieuBaoSai" (
    "id" TEXT NOT NULL,
    "hoiId" TEXT NOT NULL,
    "trangId" TEXT NOT NULL,
    "phienBan" INTEGER NOT NULL,
    "nguoiBaoId" TEXT NOT NULL,
    "cauHoi" TEXT NOT NULL,
    "ghiChu" TEXT,
    "trangThai" TEXT NOT NULL DEFAULT 'MO',
    "ketLuan" TEXT,
    "xuLyLuc" TIMESTAMP(3),
    "xuLyBoiId" TEXT,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "taiLieuBaoSai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuHoi_zaloHoiId_key" ON "taiLieuHoi"("zaloHoiId");

-- CreateIndex
CREATE INDEX "taiLieuHoi_nguoiHoiId_hoiLuc_idx" ON "taiLieuHoi"("nguoiHoiId", "hoiLuc");

-- CreateIndex
CREATE INDEX "taiLieuHoi_kenh_hoiLuc_idx" ON "taiLieuHoi"("kenh", "hoiLuc");

-- CreateIndex
CREATE INDEX "taiLieuHoi_phienId_trangThai_idx" ON "taiLieuHoi"("phienId", "trangThai");

-- CreateIndex
CREATE INDEX "taiLieuHoi_trangThai_hoiLuc_idx" ON "taiLieuHoi"("trangThai", "hoiLuc");

-- CreateIndex
CREATE INDEX "taiLieuBaoSai_trangId_trangThai_idx" ON "taiLieuBaoSai"("trangId", "trangThai");

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuBaoSai_hoiId_nguoiBaoId_trangId_key" ON "taiLieuBaoSai"("hoiId", "nguoiBaoId", "trangId");

-- AddForeignKey
ALTER TABLE "taiLieuHoi" ADD CONSTRAINT "taiLieuHoi_nguoiHoiId_fkey" FOREIGN KEY ("nguoiHoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuHoi" ADD CONSTRAINT "taiLieuHoi_xuLyBoiId_fkey" FOREIGN KEY ("xuLyBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuBaoSai" ADD CONSTRAINT "taiLieuBaoSai_hoiId_fkey" FOREIGN KEY ("hoiId") REFERENCES "taiLieuHoi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuBaoSai" ADD CONSTRAINT "taiLieuBaoSai_trangId_fkey" FOREIGN KEY ("trangId") REFERENCES "taiLieuTrang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuBaoSai" ADD CONSTRAINT "taiLieuBaoSai_nguoiBaoId_fkey" FOREIGN KEY ("nguoiBaoId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuBaoSai" ADD CONSTRAINT "taiLieuBaoSai_xuLyBoiId_fkey" FOREIGN KEY ("xuLyBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

