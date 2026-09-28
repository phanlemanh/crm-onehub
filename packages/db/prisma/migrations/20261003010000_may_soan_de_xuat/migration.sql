-- AlterTable
ALTER TABLE "taiLieuDeXuat" ADD COLUMN     "nguonId" TEXT,
ADD COLUMN     "trichDoan" JSONB;

-- CreateTable
CREATE TABLE "taiLieuNguon" (
    "id" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "tenTep" TEXT NOT NULL,
    "kieu" TEXT NOT NULL,
    "kichThuoc" INTEGER NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "taiBoiId" TEXT NOT NULL,
    "taiLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trangId" TEXT NOT NULL,
    "trangThai" TEXT NOT NULL DEFAULT 'CHO_DOC',
    "lyDo" TEXT,
    "chu" TEXT,
    "soTrang" INTEGER,
    "soanLuc" TIMESTAMP(3),
    "banGocId" TEXT,
    "phienId" TEXT,

    CONSTRAINT "taiLieuNguon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuNguon_sha256_key" ON "taiLieuNguon"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "taiLieuNguon_blobPathname_key" ON "taiLieuNguon"("blobPathname");

-- CreateIndex
CREATE INDEX "taiLieuNguon_trangId_idx" ON "taiLieuNguon"("trangId");

-- CreateIndex
CREATE INDEX "taiLieuNguon_taiBoiId_idx" ON "taiLieuNguon"("taiBoiId");

-- CreateIndex
CREATE INDEX "taiLieuNguon_phienId_idx" ON "taiLieuNguon"("phienId");

-- CreateIndex
CREATE INDEX "taiLieuDeXuat_nguonId_idx" ON "taiLieuDeXuat"("nguonId");

-- AddForeignKey
ALTER TABLE "taiLieuDeXuat" ADD CONSTRAINT "taiLieuDeXuat_nguonId_fkey" FOREIGN KEY ("nguonId") REFERENCES "taiLieuNguon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuNguon" ADD CONSTRAINT "taiLieuNguon_taiBoiId_fkey" FOREIGN KEY ("taiBoiId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taiLieuNguon" ADD CONSTRAINT "taiLieuNguon_trangId_fkey" FOREIGN KEY ("trangId") REFERENCES "taiLieuTrang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

