WITH nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
moi_nhat AS (
  SELECT DISTINCT ON (t."departmentId")
    t."departmentId", coalesce(t.cau ->> 'nac', 'bat') AS nac
  FROM "okrTomTat" t
  ORDER BY t."departmentId", t."createdAt" DESC, t.id DESC
),
truong AS (
  SELECT DISTINCT m.nac, d."headUserId" AS user_id
  FROM department d
  JOIN moi_nhat m ON m."departmentId" = d.id
  WHERE d."archivedAt" IS NULL AND d."headUserId" IS NOT NULL
)
SELECT n.nac,
  count(t.user_id)::int AS truong_phong,
  (count(t.user_id) FILTER (WHERE p."dongTroLyOkr" = false))::int AS da_tat,
  round(
    (count(t.user_id) FILTER (WHERE p."dongTroLyOkr" = false))::numeric
      / nullif(count(t.user_id), 0),
    4
  )::float AS ty_le_tat
FROM nac n
LEFT JOIN truong t ON t.nac = n.nac
LEFT JOIN "notificationPreference" p ON p."userId" = t.user_id
GROUP BY n.nac
ORDER BY n.nac DESC;
