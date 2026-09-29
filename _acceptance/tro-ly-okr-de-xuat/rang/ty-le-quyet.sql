WITH tham_so AS (
  SELECT (current_setting('okr.thang') || '-01')::date AS dau
),
khung AS (
  SELECT dau::timestamp - interval '7 hours' AS tu,
         (dau + interval '1 month')::timestamp - interval '7 hours' AS den
  FROM tham_so
),
nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
luot AS (
  SELECT t.id, coalesce(t.payload ->> 'nac', 'bat') AS nac
  FROM "agentTask" t, khung k
  WHERE t.kind = 'okr-de-xuat'
    AND t."createdAt" >= k.tu AND t."createdAt" < k.den
),
dong AS (
  SELECT d.*, l.nac AS nac_luot
  FROM "okrDeXuat" d
  JOIN luot l ON l.id = d."taskId"
),
dem AS (
  SELECT n.nac,
    (SELECT count(*) FROM luot l WHERE l.nac = n.nac)::int AS so_luot,
    count(d.id) FILTER (WHERE d."trangThai" <> 'bi-loai')::int AS sinh_ra,
    count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL)::int AS da_hien,
    count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" = 'nhan')::int AS nhan,
    count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" = 'sua')::int AS sua,
    count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" = 'bac')::int AS bac,
    count(d.id) FILTER (WHERE d."hienLuc" IS NOT NULL AND d."trangThai" = 'bo-qua')::int AS bo_qua
  FROM nac n
  LEFT JOIN dong d ON d.nac_luot = n.nac
  GROUP BY n.nac
)
SELECT nac, so_luot, sinh_ra, da_hien, nhan, sua, bac, bo_qua,
  round(nhan::numeric / nullif(da_hien, 0), 4)::float AS ty_le_nhan,
  round(sua::numeric / nullif(da_hien, 0), 4)::float AS ty_le_sua,
  round(bac::numeric / nullif(da_hien, 0), 4)::float AS ty_le_bac,
  round(bo_qua::numeric / nullif(da_hien, 0), 4)::float AS ty_le_bo_qua,
  round((nhan + sua)::numeric / nullif(da_hien, 0), 4)::float AS ty_le_duoc_nhan
FROM dem
ORDER BY nac DESC;
