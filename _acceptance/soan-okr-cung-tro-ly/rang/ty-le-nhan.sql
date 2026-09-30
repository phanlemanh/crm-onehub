WITH tham_so AS (
  SELECT current_setting('okr.chu_ky') AS chu_ky
),
nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
dong AS (
  SELECT d.id, d."trangThai", d."maLoai", d."hienLuc", c.nac
  FROM "okrDeXuat" d
  JOIN "okrCuocSoan" c ON c.id = d."cuocSoanId", tham_so t
  WHERE c."cycleId" = t.chu_ky
)
SELECT n.nac,
  count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" <> 'bi-loai')::int AS da_hien,
  count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" = 'nhan')::int AS nhan,
  count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" = 'sua')::int AS sua,
  count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" = 'bac')::int AS bac,
  round(
    (count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" IN ('nhan', 'sua')))::numeric
      / nullif(count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" <> 'bi-loai'), 0), 4
  )::float AS ty_le_duoc_nhan,
  count(d.id) FILTER (WHERE d."trangThai" = 'bi-loai')::int AS bi_loai,
  coalesce(
    (SELECT jsonb_object_agg(x."maLoai", x.so)
     FROM (
       SELECT d2."maLoai", count(*)::int AS so
       FROM dong d2
       WHERE d2.nac = n.nac AND d2."trangThai" = 'bi-loai'
       GROUP BY d2."maLoai"
     ) x),
    '{}'::jsonb
  ) AS theo_ma
FROM nac n
LEFT JOIN dong d ON d.nac = n.nac
GROUP BY n.nac
ORDER BY n.nac DESC;
