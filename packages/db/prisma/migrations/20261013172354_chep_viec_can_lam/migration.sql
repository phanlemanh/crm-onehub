-- AlterTable
ALTER TABLE "viec" ADD COLUMN     "activityGocId" TEXT,
ADD COLUMN     "khoaNguon" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "viec_activityGocId_key" ON "viec"("activityGocId");

-- CreateIndex
CREATE INDEX "viec_khoaNguon_idx" ON "viec"("khoaNguon");

-- AddForeignKey
ALTER TABLE "viec" ADD CONSTRAINT "viec_activityGocId_fkey" FOREIGN KEY ("activityGocId") REFERENCES "activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

