-- AlterTable
ALTER TABLE "onboardingStep" ADD COLUMN     "viecId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "onboardingStep_viecId_key" ON "onboardingStep"("viecId");

-- AddForeignKey
ALTER TABLE "onboardingStep" ADD CONSTRAINT "onboardingStep_viecId_fkey" FOREIGN KEY ("viecId") REFERENCES "viec"("id") ON DELETE SET NULL ON UPDATE CASCADE;
