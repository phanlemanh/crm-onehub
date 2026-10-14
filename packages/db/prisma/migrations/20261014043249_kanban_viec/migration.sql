-- AlterTable
ALTER TABLE "viec" ADD COLUMN     "chaId" TEXT;

-- CreateTable
CREATE TABLE "viecThuTu" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viecId" TEXT NOT NULL,
    "khoa" TEXT NOT NULL,
    "doiLuc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viecThuTu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "viecThuTu_userId_idx" ON "viecThuTu"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "viecThuTu_userId_viecId_key" ON "viecThuTu"("userId", "viecId");

-- CreateIndex
CREATE INDEX "viec_chaId_idx" ON "viec"("chaId");

-- AddForeignKey
ALTER TABLE "viec" ADD CONSTRAINT "viec_chaId_fkey" FOREIGN KEY ("chaId") REFERENCES "viec"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecThuTu" ADD CONSTRAINT "viecThuTu_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viecThuTu" ADD CONSTRAINT "viecThuTu_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE CASCADE ON UPDATE CASCADE;
