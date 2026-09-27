WITH tham_so AS (
  SELECT
    current_setting('okr.cycle_id') AS cycle_id,
    current_setting('okr.phut')::numeric AS phut
),
muc_tieu AS (
  SELECT o.id, o.level, o."divisionId", o."departmentId", o."personUserId"
  FROM "okrObjective" o
  CROSS JOIN tham_so t
  WHERE o."cycleId" = t.cycle_id
    AND o.status = 'cong-bo'
),
kr AS (
  SELECT
    k.id,
    m.level,
    m."divisionId",
    m."departmentId",
    m."personUserId",
    d.diem,
    d."diemGoiY",
    d."chamBoiUserId",
    d."chamLuc"
  FROM "okrKeyResult" k
  JOIN muc_tieu m ON m.id = k."objectiveId"
  LEFT JOIN "okrDiemKr" d ON d."keyResultId" = k.id
),
lan_cham AS (
  SELECT
    CASE level
      WHEN 'onehub' THEN 'goc'
      WHEN 'bo-phan' THEN 'bp:' || "divisionId"
      WHEN 'phong-ban' THEN 'pb:' || "departmentId"
      ELSE 'nguoi:' || "personUserId"
    END AS don_vi,
    "chamBoiUserId",
    "chamLuc"
  FROM kr
  WHERE diem IS NOT NULL
    AND "chamLuc" IS NOT NULL
),
cham_don AS (
  SELECT l.don_vi
  FROM lan_cham l
  CROSS JOIN tham_so t
  GROUP BY l.don_vi, t.phut
  HAVING count(DISTINCT l."chamBoiUserId") = 1
    AND max(l."chamLuc") - min(l."chamLuc") <= t.phut * interval '1 minute'
)
SELECT
  (SELECT c.phase FROM "okrCycle" c CROSS JOIN tham_so t WHERE c.id = t.cycle_id) AS pha,
  (SELECT count(*)::int FROM muc_tieu) AS "mucTieu",
  (SELECT count(*)::int FROM kr WHERE diem IS NOT NULL) AS "krCoDiem",
  (SELECT count(*)::int FROM kr) AS "krTong",
  (
    SELECT count(*)::int
    FROM muc_tieu m
    JOIN "okrNhinLai" n ON n."objectiveId" = m.id
    WHERE btrim(n."dieuHocDuoc") <> ''
  ) AS "coHocDuoc",
  (
    SELECT count(DISTINCT s."tuObjectiveId")::int
    FROM "okrMangSang" s
    JOIN muc_tieu m ON m.id = s."tuObjectiveId"
  ) AS "mangSang",
  (SELECT count(*)::int FROM kr WHERE diem IS NOT NULL AND diem <> "diemGoiY") AS "khacGoiY",
  (SELECT count(*)::int FROM cham_don) AS "chamDon";
