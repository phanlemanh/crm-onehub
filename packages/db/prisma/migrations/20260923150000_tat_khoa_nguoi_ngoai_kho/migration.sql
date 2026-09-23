UPDATE "apikey" SET "enabled" = false, "updatedAt" = NOW()
WHERE "enabled" IS DISTINCT FROM false
  AND EXISTS (SELECT 1 FROM "member" WHERE "organizationId" = 'workspace')
  AND NOT EXISTS (
    SELECT 1 FROM "member" m
    WHERE m."userId" = "apikey"."referenceId" AND m."organizationId" = 'workspace'
  );
