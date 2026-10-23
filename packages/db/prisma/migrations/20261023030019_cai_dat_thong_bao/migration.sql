-- AlterTable
ALTER TABLE "thongBao" ADD COLUMN     "dayKenh" TEXT,
ADD COLUMN     "dayLan" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dayLoi" TEXT,
ADD COLUMN     "dayLuc" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "caiDatThongBao" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "dayRa" BOOLEAN NOT NULL,
    "doiLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caiDatThongBao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "caiDatThongBao_userId_loai_key" ON "caiDatThongBao"("userId", "loai");

-- CreateIndex
CREATE INDEX "thongBao_dayLuc_taoLuc_idx" ON "thongBao"("dayLuc", "taoLuc");

-- AddForeignKey
ALTER TABLE "caiDatThongBao" ADD CONSTRAINT "caiDatThongBao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

