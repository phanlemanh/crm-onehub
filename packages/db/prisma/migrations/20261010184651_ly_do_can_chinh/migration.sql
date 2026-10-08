ALTER TABLE "okrAlignment" ADD COLUMN "lyDo" TEXT;
ALTER TABLE "okrAlignment" ADD COLUMN "canCu" TEXT;
ALTER TABLE "okrAlignment" ADD COLUMN "lyDoTuKara" BOOLEAN NOT NULL DEFAULT false;
UPDATE "okrAlignment" AS a SET "lyDo" = btrim(d."noiDung"->>'viSao', E' \t\n\r\u00a0'), "lyDoTuKara" = true FROM "okrDeXuat" AS d WHERE d."taoRaId" = a."id" AND d."loai" = 'can-chinh-moi' AND a."lyDo" IS NULL AND btrim(COALESCE(d."noiDung"->>'viSao', ''), E' \t\n\r\u00a0') <> '';
