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
  SELECT t.id, coalesce(t.payload ->> 'nac', 'bat') AS nac, t."createdAt", t."finishedAt"
  FROM "agentTask" t, khung k
  WHERE t.kind = 'okr-de-xuat'
    AND t."createdAt" >= k.tu AND t."createdAt" < k.den
),
tre AS (
  SELECT l.nac,
    (extract(epoch FROM (
      coalesce(
        (SELECT min(d."createdAt") FROM "okrDeXuat" d WHERE d."taskId" = l.id),
        l."finishedAt"
      ) - l."createdAt"
    )) * 1000)::float8 AS ms
  FROM luot l
)
SELECT n.nac,
  count(t.ms)::int AS so_luot_do,
  round((percentile_cont(0.5) WITHIN GROUP (ORDER BY t.ms))::numeric)::int AS p50_ms,
  round((percentile_cont(0.9) WITHIN GROUP (ORDER BY t.ms))::numeric)::int AS p90_ms
FROM nac n
LEFT JOIN tre t ON t.nac = n.nac AND t.ms IS NOT NULL
GROUP BY n.nac
ORDER BY n.nac DESC;
