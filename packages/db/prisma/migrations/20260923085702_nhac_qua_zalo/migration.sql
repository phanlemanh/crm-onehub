-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('AUTO', 'ZALO', 'SLACK');

-- AlterTable
ALTER TABLE "appSetting" ADD COLUMN     "zaloBotName" TEXT,
ADD COLUMN     "zaloPolledAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "zaloLink" (
    "id" TEXT NOT NULL,
    "crmUserId" TEXT NOT NULL,
    "zaloUserId" TEXT NOT NULL,
    "zaloDisplayName" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zaloLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zaloLinkCode" (
    "id" TEXT NOT NULL,
    "crmUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zaloLinkCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zaloLinkAttempt" (
    "zaloUserId" TEXT NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zaloLinkAttempt_pkey" PRIMARY KEY ("zaloUserId")
);

-- CreateTable
CREATE TABLE "zaloUpdateSeen" (
    "messageId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zaloUpdateSeen_pkey" PRIMARY KEY ("messageId")
);

-- CreateTable
CREATE TABLE "notificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'AUTO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zaloLink_crmUserId_key" ON "zaloLink"("crmUserId");

-- CreateIndex
CREATE UNIQUE INDEX "zaloLink_zaloUserId_key" ON "zaloLink"("zaloUserId");

-- CreateIndex
CREATE UNIQUE INDEX "zaloLinkCode_crmUserId_key" ON "zaloLinkCode"("crmUserId");

-- CreateIndex
CREATE UNIQUE INDEX "zaloLinkCode_codeHash_key" ON "zaloLinkCode"("codeHash");

-- CreateIndex
CREATE INDEX "zaloUpdateSeen_seenAt_idx" ON "zaloUpdateSeen"("seenAt");

-- CreateIndex
CREATE UNIQUE INDEX "notificationPreference_userId_key" ON "notificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "zaloLink" ADD CONSTRAINT "zaloLink_crmUserId_fkey" FOREIGN KEY ("crmUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zaloLinkCode" ADD CONSTRAINT "zaloLinkCode_crmUserId_fkey" FOREIGN KEY ("crmUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificationPreference" ADD CONSTRAINT "notificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
