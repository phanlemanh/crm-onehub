-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'PLAN_CHANGE';

-- AlterTable
ALTER TABLE "activity" ADD COLUMN     "planId" TEXT;

-- CreateIndex
CREATE INDEX "activity_planId_createdAt_idx" ON "activity"("planId", "createdAt");

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
