-- CreateEnum
CREATE TYPE "DealStageKind" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "dealStage" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" "DealStageKind" NOT NULL,
    "position" INTEGER NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dealStage_kind_position_idx" ON "dealStage"("kind", "position");

INSERT INTO "dealStage" ("id", "label", "kind", "position", "updatedAt") VALUES
    ('DEMO_BOOKED', 'Demo booked', 'OPEN', 0, CURRENT_TIMESTAMP),
    ('QUALIFIED_TO_BUY', 'Qualified to buy', 'OPEN', 1, CURRENT_TIMESTAMP),
    ('DECISION_MAKER_BOUGHT_IN', 'Decision maker in', 'OPEN', 2, CURRENT_TIMESTAMP),
    ('CONTRACT_SENT', 'Contract sent', 'OPEN', 3, CURRENT_TIMESTAMP),
    ('CLOSED_WON', 'Closed won', 'WON', 0, CURRENT_TIMESTAMP),
    ('CLOSED_LOST', 'Closed lost', 'LOST', 0, CURRENT_TIMESTAMP),
    ('UNQUALIFIED_TO_BUY', 'Unqualified', 'LOST', 1, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "deal" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "deal" ALTER COLUMN "stage" TYPE TEXT USING ("stage"::text);
ALTER TABLE "deal" ALTER COLUMN "stage" SET DEFAULT 'DEMO_BOOKED';

-- DropEnum
DROP TYPE "DealStage";

-- AddForeignKey
ALTER TABLE "deal" ADD CONSTRAINT "deal_stage_fkey" FOREIGN KEY ("stage") REFERENCES "dealStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
