WITH tham_so AS (
  SELECT current_setting('okr.chu_ky') AS chu_ky
),
nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
phien AS (
  SELECT unnest(c."cacPhien") AS "sessionId", c.nac
  FROM "okrCuocSoan" c, tham_so t
  WHERE c."cycleId" = t.chu_ky
),
nhan AS (
  SELECT e."sessionId", e."emittedAt" AS luc, p.nac
  FROM "agentEvent" e
  JOIN phien p ON p."sessionId" = e."sessionId"
  WHERE e.type = 'message.received'
),
xong AS (
  SELECT e."sessionId", e."emittedAt" AS luc
  FROM "agentEvent" e
  JOIN phien p ON p."sessionId" = e."sessionId"
  WHERE e.type = 'step.completed'
),
luot AS (
  SELECT n.nac,
    extract(epoch FROM (min(x.luc) - n.luc)) * 1000 AS ms
  FROM nhan n
  JOIN xong x ON x."sessionId" = n."sessionId" AND x.luc > n.luc
  GROUP BY n."sessionId", n.luc, n.nac
)
SELECT n.nac,
  count(l.ms)::int AS so_luot_do,
  round((percentile_cont(0.5) WITHIN GROUP (ORDER BY l.ms))::numeric)::int AS p50_ms,
  round((percentile_cont(0.9) WITHIN GROUP (ORDER BY l.ms))::numeric)::int AS p90_ms
FROM nac n
LEFT JOIN luot l ON l.nac = n.nac
GROUP BY n.nac
ORDER BY n.nac DESC;
