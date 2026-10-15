-- CreateTable
CREATE TABLE "BanChupLoTrinh" (
    "nguon" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "commitLuc" TIMESTAMP(3) NOT NULL,
    "layLuc" TIMESTAMP(3) NOT NULL,
    "duLieu" JSONB NOT NULL,
    "canhBao" TEXT[],

    CONSTRAINT "BanChupLoTrinh_pkey" PRIMARY KEY ("nguon")
);

