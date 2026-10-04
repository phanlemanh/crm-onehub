WITH tham_so AS (
  SELECT current_setting('okr.chu_ky') AS chu_ky
),
nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
muc_tieu AS (
  SELECT DISTINCT o.id, o."createdAt", o."publishedAt", c.nac
  FROM "okrTrail" t
  JOIN "okrObjective" o ON o.id = t."objectiveId"
  JOIN "okrCuocSoan" c ON c.id = split_part(t.note, ':', 2), tham_so p
  WHERE t.action = 'tao' AND t.note LIKE 'soan-okr:%'
    AND c."cycleId" = p.chu_ky
)
SELECT n.nac,
  count(m.id)::int AS muc_tieu_nhap,
  count(m.id) FILTER (
    WHERE m."publishedAt" IS NOT NULL
      AND m."publishedAt" - m."createdAt" <= interval '14 days'
  )::int AS cong_bo_14_ngay,
  round(
    (count(m.id) FILTER (
      WHERE m."publishedAt" IS NOT NULL
        AND m."publishedAt" - m."createdAt" <= interval '14 days'
    ))::numeric / nullif(count(m.id), 0), 4
  )::float AS ty_le_cong_bo_14_ngay
FROM nac n
LEFT JOIN muc_tieu m ON m.nac = n.nac
GROUP BY n.nac
ORDER BY n.nac DESC;
