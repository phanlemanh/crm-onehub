-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboardingTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "partnerType" TEXT,
    "steps" JSONB NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboardingTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboardingPlan" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "templateId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "targetDays" INTEGER NOT NULL,
    "closedAt" TIMESTAMP(3),
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboardingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboardingStep" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboardingEnrollment" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "accountAt" TIMESTAMP(3),
    "courseAt" TIMESTAMP(3),
    "activeAt" TIMESTAMP(3),
    "dealAt" TIMESTAMP(3),
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboardingEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "department_position_idx" ON "department"("position");

-- CreateIndex
CREATE INDEX "onboardingPlan_companyId_startedAt_idx" ON "onboardingPlan"("companyId", "startedAt");

-- CreateIndex
CREATE INDEX "onboardingPlan_closedAt_idx" ON "onboardingPlan"("closedAt");

-- CreateIndex
CREATE INDEX "onboardingPlan_ownerId_idx" ON "onboardingPlan"("ownerId");

-- CreateIndex
CREATE INDEX "onboardingStep_planId_position_idx" ON "onboardingStep"("planId", "position");

-- CreateIndex
CREATE INDEX "onboardingStep_departmentId_idx" ON "onboardingStep"("departmentId");

-- CreateIndex
CREATE INDEX "onboardingStep_assigneeId_idx" ON "onboardingStep"("assigneeId");

-- CreateIndex
CREATE INDEX "onboardingStep_completedAt_idx" ON "onboardingStep"("completedAt");

-- CreateIndex
CREATE INDEX "onboardingEnrollment_planId_idx" ON "onboardingEnrollment"("planId");

-- CreateIndex
CREATE INDEX "onboardingEnrollment_contactId_idx" ON "onboardingEnrollment"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "onboardingEnrollment_planId_contactId_key" ON "onboardingEnrollment"("planId", "contactId");

-- AddForeignKey
ALTER TABLE "onboardingPlan" ADD CONSTRAINT "onboardingPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingPlan" ADD CONSTRAINT "onboardingPlan_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "onboardingTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingPlan" ADD CONSTRAINT "onboardingPlan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingStep" ADD CONSTRAINT "onboardingStep_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingStep" ADD CONSTRAINT "onboardingStep_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingStep" ADD CONSTRAINT "onboardingStep_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingEnrollment" ADD CONSTRAINT "onboardingEnrollment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "onboardingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboardingEnrollment" ADD CONSTRAINT "onboardingEnrollment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
