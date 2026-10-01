WITH tham_so AS (
  SELECT (current_setting('okr.thang') || '-01')::date AS dau
),
khung AS (
  SELECT dau::timestamp - interval '7 hours' AS tu,
         (dau + interval '1 month')::timestamp - interval '7 hours' AS den
  FROM tham_so
),
nac AS (
  SELECT unnest(ARRAY['bat', 'an', 'khong-ro']) AS nac
),
dong AS (
  SELECT c."tinhNang", c."costUsd", coalesce(t.payload ->> 'nac', 'khong-ro') AS nac
  FROM "aiChiPhi" c
  JOIN "agentTask" t ON t.id = c."taskId", khung k
  WHERE c.at >= k.tu AND c.at < k.den
    AND t.kind = 'okr-tom-tat-tuan'
    AND c."tinhNang" IN ('okr.tom-tat', 'okr.chuyen-tiep')
),
tien AS (
  SELECT nac,
    sum("costUsd") AS usd,
    sum("costUsd") FILTER (WHERE "tinhNang" = 'okr.tom-tat') AS tom_tat,
    sum("costUsd") FILTER (WHERE "tinhNang" = 'okr.chuyen-tiep') AS chuyen_tiep
  FROM dong
  GROUP BY nac
),
ban AS (
  SELECT coalesce(b.cau ->> 'nac', 'khong-ro') AS nac, count(*)::int AS so
  FROM "okrTomTat" b, khung k
  WHERE b."createdAt" >= k.tu AND b."createdAt" < k.den
  GROUP BY 1
)
SELECT n.nac,
  round(coalesce(t.usd, 0), 6)::float AS tien_usd,
  round(coalesce(t.tom_tat, 0), 6)::float AS tom_tat_usd,
  round(coalesce(t.chuyen_tiep, 0), 6)::float AS chuyen_tiep_usd,
  coalesce(b.so, 0) AS so_ban,
  round(coalesce(t.usd, 0) / nullif(coalesce(b.so, 0), 0), 6)::float AS usd_moi_ban
FROM nac n
LEFT JOIN tien t ON t.nac = n.nac
LEFT JOIN ban b ON b.nac = n.nac
ORDER BY n.nac DESC;
