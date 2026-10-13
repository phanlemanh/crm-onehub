-- CreateTable
CREATE TABLE "tinHieu" (
    "id" TEXT NOT NULL,
    "so" SERIAL NOT NULL,
    "nguoiGuiId" TEXT,
    "phongBanId" TEXT,
    "muonLam" TEXT NOT NULL,
    "daXayRa" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "man" TEXT NOT NULL,
    "guiLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keoVeLuc" TIMESTAMP(3),

    CONSTRAINT "tinHieu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tinHieu_so_key" ON "tinHieu"("so");

-- CreateIndex
CREATE INDEX "tinHieu_nguoiGuiId_guiLuc_idx" ON "tinHieu"("nguoiGuiId", "guiLuc");

-- AddForeignKey
ALTER TABLE "tinHieu" ADD CONSTRAINT "tinHieu_nguoiGuiId_fkey" FOREIGN KEY ("nguoiGuiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tinHieu" ADD CONSTRAINT "tinHieu_phongBanId_fkey" FOREIGN KEY ("phongBanId") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
