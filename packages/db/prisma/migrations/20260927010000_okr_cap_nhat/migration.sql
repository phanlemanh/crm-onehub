-- CreateTable
CREATE TABLE "okrCheckInSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entry" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "seconds" INTEGER,

    CONSTRAINT "okrCheckInSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrCheckIn" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,
    "confidence" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "authorUserId" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "onBehalf" BOOLEAN NOT NULL DEFAULT false,
    "channel" TEXT NOT NULL DEFAULT 'web',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrComment" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "keyResultId" TEXT,
    "body" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrMention" (
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "okrMention_pkey" PRIMARY KEY ("commentId","userId")
);

-- CreateTable
CREATE TABLE "okrFollow" (
    "objectiveId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrFollow_pkey" PRIMARY KEY ("objectiveId","userId")
);

-- CreateIndex
CREATE INDEX "okrCheckInSession_userId_openedAt_idx" ON "okrCheckInSession"("userId", "openedAt");

-- CreateIndex
CREATE INDEX "okrCheckInSession_submittedAt_idx" ON "okrCheckInSession"("submittedAt");

-- CreateIndex
CREATE INDEX "okrCheckIn_keyResultId_createdAt_idx" ON "okrCheckIn"("keyResultId", "createdAt");

-- CreateIndex
CREATE INDEX "okrCheckIn_weekStart_idx" ON "okrCheckIn"("weekStart");

-- CreateIndex
CREATE INDEX "okrCheckIn_authorUserId_idx" ON "okrCheckIn"("authorUserId");

-- CreateIndex
CREATE INDEX "okrComment_objectiveId_createdAt_idx" ON "okrComment"("objectiveId", "createdAt");

-- CreateIndex
CREATE INDEX "okrComment_createdAt_idx" ON "okrComment"("createdAt");

-- CreateIndex
CREATE INDEX "okrMention_userId_idx" ON "okrMention"("userId");

-- CreateIndex
CREATE INDEX "okrFollow_userId_idx" ON "okrFollow"("userId");

-- AddForeignKey
ALTER TABLE "okrCheckIn" ADD CONSTRAINT "okrCheckIn_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrCheckIn" ADD CONSTRAINT "okrCheckIn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "okrCheckInSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrComment" ADD CONSTRAINT "okrComment_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrComment" ADD CONSTRAINT "okrComment_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "okrKeyResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrMention" ADD CONSTRAINT "okrMention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "okrComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrFollow" ADD CONSTRAINT "okrFollow_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;
