ALTER TABLE "okrCycle" ADD COLUMN "anLuc" TIMESTAMP(3);

CREATE INDEX "okrCycle_anLuc_idx" ON "okrCycle"("anLuc");
