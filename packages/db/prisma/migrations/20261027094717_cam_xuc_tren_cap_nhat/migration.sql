-- AlterTable
ALTER TABLE "okrComment" ADD COLUMN     "checkInId" TEXT;

-- CreateTable
CREATE TABLE "okrCamXuc" (
    "id" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrCamXuc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "okrComment_checkInId_idx" ON "okrComment"("checkInId");

-- CreateIndex
CREATE INDEX "okrCamXuc_checkInId_idx" ON "okrCamXuc"("checkInId");

-- CreateIndex
CREATE UNIQUE INDEX "okrCamXuc_checkInId_userId_loai_key" ON "okrCamXuc"("checkInId", "userId", "loai");

-- AddForeignKey
ALTER TABLE "okrComment" ADD CONSTRAINT "okrComment_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "okrCheckIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrCamXuc" ADD CONSTRAINT "okrCamXuc_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "okrCheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrCamXuc" ADD CONSTRAINT "okrCamXuc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- LapCheckInId
UPDATE "okrComment" c SET "checkInId" = (
  SELECT ci."id" FROM "okrCheckIn" ci
  JOIN "okrCheckInSession" s ON s."id" = ci."sessionId"
  WHERE ci."keyResultId" = c."keyResultId"
    AND COALESCE(s."submittedAt", ci."createdAt") <= c."createdAt"
  ORDER BY COALESCE(s."submittedAt", ci."createdAt") DESC, ci."createdAt" DESC, ci."id" DESC
  LIMIT 1
) WHERE c."keyResultId" IS NOT NULL AND c."checkInId" IS NULL;
