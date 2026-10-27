WITH lan AS (
  SELECT ci."id", ci."authorUserId"
  FROM "okrCheckIn" ci
  JOIN "okrCheckInSession" s ON s."id" = ci."sessionId"
  JOIN "okrKeyResult" k ON k."id" = ci."keyResultId"
  JOIN "okrObjective" o ON o."id" = k."objectiveId"
  WHERE o."cycleId" = :'cycle_id'
    AND o."status" = 'cong-bo'
    AND COALESCE(s."submittedAt", ci."createdAt") >= :'tu'::timestamptz
    AND COALESCE(s."submittedAt", ci."createdAt") < :'den'::timestamptz
)
SELECT
  COUNT(*) AS so_lan,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM "okrCamXuc" x
      WHERE x."checkInId" = lan."id" AND x."userId" <> lan."authorUserId"
    ) OR EXISTS (
      SELECT 1 FROM "okrComment" c
      WHERE c."checkInId" = lan."id" AND c."authorUserId" <> lan."authorUserId"
    )
  ) AS co_phan_hoi,
  ROUND(
    COUNT(*) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM "okrCamXuc" x
        WHERE x."checkInId" = lan."id" AND x."userId" <> lan."authorUserId"
      ) OR EXISTS (
        SELECT 1 FROM "okrComment" c
        WHERE c."checkInId" = lan."id" AND c."authorUserId" <> lan."authorUserId"
      )
    )::numeric / NULLIF(COUNT(*), 0),
    4
  ) AS ty_le
FROM lan;
