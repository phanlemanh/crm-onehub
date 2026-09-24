-- AlterTable
ALTER TABLE "department" ADD COLUMN     "divisionId" TEXT,
ADD COLUMN     "headUserId" TEXT;

-- CreateTable
CREATE TABLE "division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "headUserId" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orgPlacement" (
    "userId" TEXT NOT NULL,
    "primaryDepartmentId" TEXT,
    "managerUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orgPlacement_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "orgSecondaryDepartment" (
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orgSecondaryDepartment_pkey" PRIMARY KEY ("userId","departmentId")
);

-- CreateIndex
CREATE INDEX "division_position_idx" ON "division"("position");

-- CreateIndex
CREATE INDEX "orgPlacement_primaryDepartmentId_idx" ON "orgPlacement"("primaryDepartmentId");

-- CreateIndex
CREATE INDEX "orgPlacement_managerUserId_idx" ON "orgPlacement"("managerUserId");

-- CreateIndex
CREATE INDEX "orgSecondaryDepartment_departmentId_idx" ON "orgSecondaryDepartment"("departmentId");

-- CreateIndex
CREATE INDEX "department_divisionId_idx" ON "department"("divisionId");

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_headUserId_fkey" FOREIGN KEY ("headUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "division" ADD CONSTRAINT "division_headUserId_fkey" FOREIGN KEY ("headUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgPlacement" ADD CONSTRAINT "orgPlacement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgPlacement" ADD CONSTRAINT "orgPlacement_primaryDepartmentId_fkey" FOREIGN KEY ("primaryDepartmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgPlacement" ADD CONSTRAINT "orgPlacement_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgSecondaryDepartment" ADD CONSTRAINT "orgSecondaryDepartment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orgSecondaryDepartment" ADD CONSTRAINT "orgSecondaryDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
