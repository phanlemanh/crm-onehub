-- CreateTable
CREATE TABLE "okrCuocHoi" (
    "id" TEXT NOT NULL,
    "nguoiHoiUserId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cacPhien" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "streamIndex" INTEGER NOT NULL DEFAULT 0,
    "continuationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrCuocHoi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrLuotHoi" (
    "id" TEXT NOT NULL,
    "cuocHoiId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ngay" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "okrLuotHoi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "okrHoiPhanHoi" (
    "id" TEXT NOT NULL,
    "cuocHoiId" TEXT NOT NULL,
    "maTraLoi" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "huuIch" BOOLEAN NOT NULL,
    "luc" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "okrHoiPhanHoi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "okrCuocHoi_sessionId_key" ON "okrCuocHoi"("sessionId");

-- CreateIndex
CREATE INDEX "okrCuocHoi_nguoiHoiUserId_createdAt_idx" ON "okrCuocHoi"("nguoiHoiUserId", "createdAt");

-- CreateIndex
CREATE INDEX "okrLuotHoi_userId_ngay_idx" ON "okrLuotHoi"("userId", "ngay");

-- CreateIndex
CREATE UNIQUE INDEX "okrHoiPhanHoi_cuocHoiId_maTraLoi_userId_key" ON "okrHoiPhanHoi"("cuocHoiId", "maTraLoi", "userId");

