-- CreateEnum
CREATE TYPE "CampaignChannel" AS ENUM ('PHONE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'RUNNING', 'FINISHED');

-- CreateEnum
CREATE TYPE "TouchOutcome" AS ENUM ('NO_ANSWER', 'ANSWERED', 'MEETING', 'DECLINED', 'WRONG_NUMBER');

-- AlterEnum
ALTER TYPE "RecordSource" ADD VALUE 'LISTING';

-- CreateTable
CREATE TABLE "campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "CampaignChannel" NOT NULL DEFAULT 'PHONE',
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "script" TEXT,
    "savedViewId" TEXT NOT NULL,
    "ownerId" TEXT,
    "createdById" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaignTouch" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "outcome" "TouchOutcome" NOT NULL,
    "note" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaignTouch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_status_createdAt_idx" ON "campaign"("status", "createdAt");

-- CreateIndex
CREATE INDEX "campaign_savedViewId_idx" ON "campaign"("savedViewId");

-- CreateIndex
CREATE INDEX "campaign_ownerId_idx" ON "campaign"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "campaignTouch_activityId_key" ON "campaignTouch"("activityId");

-- CreateIndex
CREATE INDEX "campaignTouch_campaignId_contactId_idx" ON "campaignTouch"("campaignId", "contactId");

-- CreateIndex
CREATE INDEX "campaignTouch_contactId_idx" ON "campaignTouch"("contactId");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_savedViewId_fkey" FOREIGN KEY ("savedViewId") REFERENCES "savedView"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaignTouch" ADD CONSTRAINT "campaignTouch_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaignTouch" ADD CONSTRAINT "campaignTouch_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaignTouch" ADD CONSTRAINT "campaignTouch_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaignTouch" ADD CONSTRAINT "campaignTouch_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
