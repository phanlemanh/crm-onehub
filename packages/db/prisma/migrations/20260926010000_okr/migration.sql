-- CreateTable
CREATE TABLE "okrCycle" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'lap-ke-hoach',
    "breakStartsOn" DATE,
    "breakEndsOn" DATE,
    "updateWeekday" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrProgramConfig" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "objectiveCap" INTEGER NOT NULL,
    "krCap" INTEGER NOT NULL,
    "capMode" TEXT NOT NULL,
    "scoreScale" TEXT NOT NULL,
    "weightsOn" BOOLEAN NOT NULL,
    "personalOn" BOOLEAN NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrProgramConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrObjective" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "divisionId" TEXT,
    "departmentId" TEXT,
    "personUserId" TEXT,
    "ownerUserId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'nhap',
    "title" TEXT NOT NULL,
    "whyNow" TEXT NOT NULL DEFAULT '',
    "publishedAt" TIMESTAMP(3),
    "droppedAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrParticipant" (
    "objectiveId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrParticipant_pkey" PRIMARY KEY ("objectiveId","userId")
);

-- CreateTable
CREATE TABLE "okrKeyResult" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "startValue" DECIMAL(18,4) NOT NULL,
    "targetValue" DECIMAL(18,4) NOT NULL,
    "currentValue" DECIMAL(18,4) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '',
    "dueOn" DATE,
    "weight" DECIMAL(6,2) NOT NULL DEFAULT 1,
    "source" TEXT NOT NULL DEFAULT 'tay',
    "startLockedAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrKeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrAlignment" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "targetObjectiveId" TEXT,
    "targetKeyResultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrAlignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrTrail" (
    "id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorUserId" TEXT NOT NULL,
    "cycleId" TEXT,
    "objectiveId" TEXT,
    "keyResultId" TEXT,
    "action" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "note" TEXT,

    CONSTRAINT "okrTrail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "okrCycle_parentId_idx" ON "okrCycle"("parentId");

-- CreateIndex
CREATE INDEX "okrCycle_startsOn_idx" ON "okrCycle"("startsOn");

-- CreateIndex
CREATE UNIQUE INDEX "okrProgramConfig_version_key" ON "okrProgramConfig"("version");

-- CreateIndex
CREATE INDEX "okrObjective_cycleId_level_idx" ON "okrObjective"("cycleId", "level");

-- CreateIndex
CREATE INDEX "okrObjective_divisionId_idx" ON "okrObjective"("divisionId");

-- CreateIndex
CREATE INDEX "okrObjective_departmentId_idx" ON "okrObjective"("departmentId");

-- CreateIndex
CREATE INDEX "okrObjective_personUserId_idx" ON "okrObjective"("personUserId");

-- CreateIndex
CREATE INDEX "okrObjective_ownerUserId_idx" ON "okrObjective"("ownerUserId");

-- CreateIndex
CREATE INDEX "okrParticipant_userId_idx" ON "okrParticipant"("userId");

-- CreateIndex
CREATE INDEX "okrKeyResult_objectiveId_position_idx" ON "okrKeyResult"("objectiveId", "position");

-- CreateIndex
CREATE INDEX "okrKeyResult_ownerUserId_idx" ON "okrKeyResult"("ownerUserId");

-- CreateIndex
CREATE INDEX "okrAlignment_targetObjectiveId_idx" ON "okrAlignment"("targetObjectiveId");

-- CreateIndex
CREATE INDEX "okrAlignment_targetKeyResultId_idx" ON "okrAlignment"("targetKeyResultId");

-- CreateIndex
CREATE UNIQUE INDEX "okrAlignment_objectiveId_targetObjectiveId_targetKeyResultI_key" ON "okrAlignment"("objectiveId", "targetObjectiveId", "targetKeyResultId");

-- CreateIndex
CREATE INDEX "okrTrail_objectiveId_at_idx" ON "okrTrail"("objectiveId", "at");

-- CreateIndex
CREATE INDEX "okrTrail_cycleId_at_idx" ON "okrTrail"("cycleId", "at");

-- CreateIndex
CREATE INDEX "okrTrail_at_idx" ON "okrTrail"("at");

-- AddForeignKey
ALTER TABLE "okrCycle" ADD CONSTRAINT "okrCycle_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrObjective" ADD CONSTRAINT "okrObjective_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "okrCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrObjective" ADD CONSTRAINT "okrObjective_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrObjective" ADD CONSTRAINT "okrObjective_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrObjective" ADD CONSTRAINT "okrObjective_personUserId_fkey" FOREIGN KEY ("personUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrObjective" ADD CONSTRAINT "okrObjective_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrParticipant" ADD CONSTRAINT "okrParticipant_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrParticipant" ADD CONSTRAINT "okrParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrKeyResult" ADD CONSTRAINT "okrKeyResult_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrKeyResult" ADD CONSTRAINT "okrKeyResult_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrAlignment" ADD CONSTRAINT "okrAlignment_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrAlignment" ADD CONSTRAINT "okrAlignment_targetObjectiveId_fkey" FOREIGN KEY ("targetObjectiveId") REFERENCES "okrObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "okrAlignment" ADD CONSTRAINT "okrAlignment_targetKeyResultId_fkey" FOREIGN KEY ("targetKeyResultId") REFERENCES "okrKeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
