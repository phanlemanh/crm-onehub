WITH tham_so AS (
  SELECT current_setting('okr.chu_ky') AS cycle_id
),
muc_tieu AS (
  SELECT o.id, o.level, o."departmentId"
  FROM "okrObjective" o
  CROSS JOIN tham_so t
  WHERE o."cycleId" = t.cycle_id
    AND o.status = 'cong-bo'
),
kr AS (
  SELECT k.id, k."objectiveId", k.kind, k."currentValue"
  FROM "okrKeyResult" k
  JOIN muc_tieu m ON m.id = k."objectiveId"
),
canh AS (
  SELECT v.loai, v."xongLuc", k."objectiveId"
  FROM "okrViecKr" v
  JOIN kr k ON k.id = v."keyResultId"
),
moc_xong AS (
  SELECT k.id
  FROM kr k
  WHERE k.kind = 'moc'
    AND k."currentValue" = 1
),
ghi_nhan AS (
  SELECT g.id, m.level, m."departmentId"
  FROM "okrGhiNhan" g
  JOIN muc_tieu m ON m.id = g."objectiveId"
),
tu_mau AS (
  SELECT o.id
  FROM "okrObjective" o
  JOIN "okrMucTieuTuMau" t ON t."objectiveId" = o.id
  CROSS JOIN tham_so s
  WHERE o."cycleId" = s.cycle_id
    AND o.status = 'cong-bo'
    AND o.level = 'phong-ban'
)
SELECT
  (SELECT count(*)::int FROM muc_tieu) AS "mucTieu",
  (SELECT count(DISTINCT c."objectiveId")::int FROM canh c) AS "coViecHaySangKien",
  (SELECT count(*)::int FROM moc_xong) AS "mocXong",
  (
    SELECT count(DISTINCT m.id)::int
    FROM moc_xong m
    JOIN "okrBangChung" b ON b."keyResultId" = m.id
  ) AS "mocCoBangChung",
  (
    SELECT count(DISTINCT g."departmentId")::int
    FROM ghi_nhan g
    WHERE g.level = 'phong-ban'
  ) AS "phongBanCoGhiNhan",
  (SELECT count(*)::int FROM "department" d WHERE d."archivedAt" IS NULL) AS "phongBanTong",
  (SELECT count(*)::int FROM ghi_nhan) AS "ghiNhanTong",
  (SELECT count(*)::int FROM muc_tieu WHERE level = 'phong-ban') AS "mucTieuPhongBan",
  (SELECT count(*)::int FROM tu_mau) AS "tuMauPhongBan",
  (SELECT count(*)::int FROM canh WHERE loai = 'viec' AND "xongLuc" IS NOT NULL) AS "viecXong",
  (SELECT count(*)::int FROM canh WHERE loai = 'viec') AS "viecTong",
  (SELECT count(*)::int FROM canh WHERE loai = 'ke-hoach') AS "sangKienKeHoach",
  (SELECT count(*)::int FROM canh WHERE loai IN ('chien-dich', 'ke-hoach')) AS "sangKienTong";
