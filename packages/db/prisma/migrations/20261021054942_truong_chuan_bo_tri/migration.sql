-- CreateTable
CREATE TABLE "standardFieldLayout" (
    "entity" "FieldEntity" NOT NULL,
    "key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "standardFieldLayout_pkey" PRIMARY KEY ("entity","key")
);
