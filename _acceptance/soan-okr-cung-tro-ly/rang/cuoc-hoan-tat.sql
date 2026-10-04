WITH tham_so AS (
  SELECT current_setting('okr.chu_ky') AS chu_ky
),
nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
cuoc AS (
  SELECT c.id, c.nac, c."trangThai",
    c.level || ':' || coalesce(c."divisionId", '-') || ':' || coalesce(c."departmentId", '-') AS don_vi
  FROM "okrCuocSoan" c, tham_so t
  WHERE c."cycleId" = t.chu_ky
)
SELECT n.nac,
  count(c.id)::int AS cuoc_mo,
  count(c.id) FILTER (WHERE c."trangThai" = 'da-dua-vao')::int AS cuoc_dua_vao,
  count(DISTINCT c.don_vi)::int AS don_vi_co_cuoc,
  count(DISTINCT c.don_vi) FILTER (WHERE c."trangThai" = 'da-dua-vao')::int AS don_vi_hoan_tat,
  round(
    (count(DISTINCT c.don_vi) FILTER (WHERE c."trangThai" = 'da-dua-vao'))::numeric
      / nullif(count(DISTINCT c.don_vi), 0), 4
  )::float AS ty_le_don_vi_hoan_tat
FROM nac n
LEFT JOIN cuoc c ON c.nac = n.nac
GROUP BY n.nac
ORDER BY n.nac DESC;
