WITH thanh_vien AS (
  SELECT m."userId" AS id
  FROM "member" m
  WHERE m."organizationId" = 'workspace'
),
muc_tieu AS (
  SELECT o.id, o.level, o."departmentId", o."divisionId", o."personUserId", o."ownerUserId"
  FROM "okrObjective" o
  JOIN "okrCycle" c ON c.id = o."cycleId"
  WHERE o.status <> 'da-bo'
    AND c.phase IN ('lap-ke-hoach', 'dang-chay', 'cham-diem')
),
bo_phan_song AS (
  SELECT b.id, b."headUserId"
  FROM "division" b
  WHERE b."archivedAt" IS NULL
),
phong_ban_song AS (
  SELECT p.id, p."headUserId", p."divisionId"
  FROM "department" p
  WHERE p."archivedAt" IS NULL
),
truong_phong_ban AS (
  SELECT p.id
  FROM phong_ban_song p
  JOIN thanh_vien t ON t.id = p."headUserId"
  WHERE EXISTS (
      SELECT 1 FROM "orgPlacement" x
      WHERE x."userId" = p."headUserId" AND x."primaryDepartmentId" = p.id
    )
    OR EXISTS (
      SELECT 1 FROM "orgSecondaryDepartment" s
      WHERE s."userId" = p."headUserId" AND s."departmentId" = p.id
    )
),
truong_bo_phan AS (
  SELECT b.id
  FROM bo_phan_song b
  JOIN thanh_vien t ON t.id = b."headUserId"
),
lop AS (
  SELECT m.id AS "objectiveId", 'don-vi-luu-tru' AS lop
  FROM muc_tieu m
  WHERE (m.level = 'phong-ban' AND m."departmentId" NOT IN (SELECT id FROM phong_ban_song))
     OR (m.level = 'bo-phan' AND m."divisionId" NOT IN (SELECT id FROM bo_phan_song))
  UNION ALL
  SELECT m.id, 'khong-ai-sua'
  FROM muc_tieu m
  WHERE (
      m.level = 'phong-ban'
      AND m."departmentId" IN (SELECT id FROM phong_ban_song)
      AND m."departmentId" NOT IN (SELECT id FROM truong_phong_ban)
      AND NOT EXISTS (
        SELECT 1 FROM phong_ban_song p
        JOIN truong_bo_phan b ON b.id = p."divisionId"
        WHERE p.id = m."departmentId"
      )
    )
    OR (
      m.level = 'bo-phan'
      AND m."divisionId" IN (SELECT id FROM bo_phan_song)
      AND m."divisionId" NOT IN (SELECT id FROM truong_bo_phan)
    )
    OR (m.level = 'ca-nhan' AND m."personUserId" NOT IN (SELECT id FROM thanh_vien))
  UNION ALL
  SELECT m.id, 'phu-trach-roi'
  FROM muc_tieu m
  WHERE m."ownerUserId" NOT IN (SELECT id FROM thanh_vien)
  UNION ALL
  SELECT DISTINCT k."objectiveId", 'kr-phu-trach-roi'
  FROM "okrKeyResult" k
  JOIN muc_tieu m ON m.id = k."objectiveId"
  WHERE k."ownerUserId" NOT IN (SELECT id FROM thanh_vien)
)
SELECT "objectiveId", lop
FROM lop
ORDER BY "objectiveId", lop
