WITH tham_so AS (
  SELECT current_setting('okr.cuoc') AS cuoc
),
dong AS (
  SELECT d.id AS de_xuat_id, d.loai, d."trangThai" AS trang_thai, d."taoRaId" AS tao_ra_id
  FROM "okrDeXuat" d, tham_so t
  WHERE d."cuocSoanId" = t.cuoc
    AND d."trangThai" IN ('nhan', 'sua')
)
SELECT d.de_xuat_id, d.loai, d.trang_thai, d.tao_ra_id,
  CASE
    WHEN EXISTS (SELECT 1 FROM "okrObjective" o WHERE o.id = d.tao_ra_id) THEN 'okrObjective'
    WHEN EXISTS (SELECT 1 FROM "okrKeyResult" k WHERE k.id = d.tao_ra_id) THEN 'okrKeyResult'
    WHEN EXISTS (SELECT 1 FROM "okrAlignment" a WHERE a.id = d.tao_ra_id) THEN 'okrAlignment'
    ELSE NULL
  END AS bang
FROM dong d
ORDER BY d.loai, d.de_xuat_id;
