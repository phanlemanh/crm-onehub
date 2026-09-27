-- CreateTable
CREATE TABLE "zaloHoi" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "crmUserId" TEXT NOT NULL,
    "zaloChatId" TEXT NOT NULL,
    "sessionId" TEXT,
    "hoiLuc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traLoiLuc" TIMESTAMP(3),
    "doTreMs" INTEGER,
    "tokenVao" INTEGER,
    "tokenRa" INTEGER,
    "ketQua" TEXT NOT NULL,

    CONSTRAINT "zaloHoi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zaloHoi_messageId_key" ON "zaloHoi"("messageId");

-- CreateIndex
CREATE INDEX "zaloHoi_crmUserId_hoiLuc_idx" ON "zaloHoi"("crmUserId", "hoiLuc");

-- CreateIndex
CREATE INDEX "zaloHoi_zaloChatId_ketQua_idx" ON "zaloHoi"("zaloChatId", "ketQua");

-- CreateIndex
CREATE INDEX "zaloHoi_hoiLuc_idx" ON "zaloHoi"("hoiLuc");

