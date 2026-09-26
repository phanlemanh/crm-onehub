WITH tham_so AS (
  SELECT current_setting('okr.tuan') AS tuan
),
don_vi AS (
  SELECT 'pb:' || d.id AS khoa, d."headUserId" AS truong
  FROM department d
  WHERE d."archivedAt" IS NULL AND d."headUserId" IS NOT NULL
  UNION ALL
  SELECT 'bp:' || b.id AS khoa, b."headUserId" AS truong
  FROM division b
  WHERE b."archivedAt" IS NULL AND b."headUserId" IS NOT NULL
),
da_mo AS (
  SELECT DISTINCT v.after ->> 'donVi' AS khoa, v."actorUserId" AS nguoi
  FROM "okrTrail" v, tham_so t
  WHERE v.action = 'mo-hop-tuan'
    AND v.after ->> 'tuan' = t.tuan
)
SELECT
  count(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM da_mo m WHERE m.khoa = dv.khoa AND m.nguoi = dv.truong
    )
  )::int AS mo,
  count(*)::int AS tong,
  round(
    (count(*) FILTER (
      WHERE EXISTS (
        SELECT 1 FROM da_mo m WHERE m.khoa = dv.khoa AND m.nguoi = dv.truong
      )
    ))::numeric / nullif(count(*), 0),
    2
  )::float AS ty_le
FROM don_vi dv;
