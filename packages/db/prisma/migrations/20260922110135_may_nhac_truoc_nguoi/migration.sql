/*
  Warnings:

  - A unique constraint covering the columns `[kind,subject]` on the table `agentTask` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "onboardingWatch" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboardingWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "onboardingWatch_userId_idx" ON "onboardingWatch"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "onboardingWatch_planId_userId_key" ON "onboardingWatch"("planId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "agentTask_nhac_mot_ngay" ON "agentTask"("kind", "subject") WHERE ("kind" = 'nhac-ke-hoach');

-- AddForeignKey
ALTER TABLE "onboardingWatch" ADD CONSTRAINT "onboardingWatch_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingWatch" ADD CONSTRAINT "onboardingWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
