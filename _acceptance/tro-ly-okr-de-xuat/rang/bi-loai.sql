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
  SELECT d.id, d."trangThai", d."maLoai", l.nac
  FROM "okrDeXuat" d
  JOIN luot l ON l.id = d."taskId"
)
SELECT n.nac,
  count(d.id)::int AS tong_cau,
  count(d.id) FILTER (WHERE d."trangThai" = 'bi-loai')::int AS bi_loai,
  round(
    (count(d.id) FILTER (WHERE d."trangThai" = 'bi-loai'))::numeric / nullif(count(d.id), 0),
    4
  )::float AS ty_le_bi_loai,
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
