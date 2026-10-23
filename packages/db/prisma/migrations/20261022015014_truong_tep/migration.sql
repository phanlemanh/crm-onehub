-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'FILE';

-- CreateTable
CREATE TABLE "fieldFile" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "companyId" TEXT,
    "contactId" TEXT,
    "dealId" TEXT,
    "tenTep" TEXT NOT NULL,
    "kieu" TEXT NOT NULL,
    "kichThuoc" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "taiBoiId" TEXT,
    "taiLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fieldFile_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "fieldFile_mot_ban_ghi" CHECK (num_nonnulls("companyId", "contactId", "dealId") = 1)
);

-- CreateTable
CREATE TABLE "blobChoXoa" (
    "pathname" TEXT NOT NULL,
    "kho" TEXT NOT NULL,
    "taoLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xoaSau" TIMESTAMP(3) NOT NULL,
    "lanThu" INTEGER NOT NULL DEFAULT 0,
    "fieldId" TEXT,
    "banGhiId" TEXT,
    "userId" TEXT,

    CONSTRAINT "blobChoXoa_pkey" PRIMARY KEY ("pathname")
);

-- CreateIndex
CREATE UNIQUE INDEX "fieldFile_blobPathname_key" ON "fieldFile"("blobPathname");

-- CreateIndex
CREATE INDEX "fieldFile_fieldId_companyId_idx" ON "fieldFile"("fieldId", "companyId");

-- CreateIndex
CREATE INDEX "fieldFile_fieldId_contactId_idx" ON "fieldFile"("fieldId", "contactId");

-- CreateIndex
CREATE INDEX "fieldFile_fieldId_dealId_idx" ON "fieldFile"("fieldId", "dealId");

-- CreateIndex
CREATE INDEX "fieldFile_taiBoiId_idx" ON "fieldFile"("taiBoiId");

-- CreateIndex
CREATE UNIQUE INDEX "fieldFile_fieldId_companyId_sha256_key" ON "fieldFile"("fieldId", "companyId", "sha256");

-- CreateIndex
CREATE UNIQUE INDEX "fieldFile_fieldId_contactId_sha256_key" ON "fieldFile"("fieldId", "contactId", "sha256");

-- CreateIndex
CREATE UNIQUE INDEX "fieldFile_fieldId_dealId_sha256_key" ON "fieldFile"("fieldId", "dealId", "sha256");

-- CreateIndex
CREATE INDEX "blobChoXoa_xoaSau_idx" ON "blobChoXoa"("xoaSau");

-- AddForeignKey
ALTER TABLE "fieldFile" ADD CONSTRAINT "fieldFile_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "fieldDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fieldFile" ADD CONSTRAINT "fieldFile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fieldFile" ADD CONSTRAINT "fieldFile_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fieldFile" ADD CONSTRAINT "fieldFile_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fieldFile" ADD CONSTRAINT "fieldFile_taiBoiId_fkey" FOREIGN KEY ("taiBoiId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
