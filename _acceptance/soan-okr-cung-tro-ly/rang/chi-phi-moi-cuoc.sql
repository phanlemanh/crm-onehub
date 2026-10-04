WITH tham_so AS (
  SELECT current_setting('okr.chu_ky') AS chu_ky
),
nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
cuoc AS (
  SELECT c.id, c.nac, c."cacPhien"
  FROM "okrCuocSoan" c, tham_so t
  WHERE c."cycleId" = t.chu_ky
),
tien_cuoc AS (
  SELECT c.id, c.nac, coalesce(sum(p."costUsd"), 0) AS usd
  FROM cuoc c
  LEFT JOIN "aiChiPhi" p ON p."sessionId" = ANY(c."cacPhien") AND p."tinhNang" = 'okr.soan'
  GROUP BY c.id, c.nac
)
SELECT n.nac,
  count(t.id)::int AS so_cuoc,
  round(coalesce(sum(t.usd), 0), 6)::float AS tien_usd,
  round(coalesce(sum(t.usd), 0) / nullif(count(t.id), 0), 6)::float AS chi_phi_moi_cuoc_usd,
  coalesce(
    (SELECT jsonb_object_agg(t2.id, round(t2.usd, 6)::float)
     FROM tien_cuoc t2 WHERE t2.nac = n.nac),
    '{}'::jsonb
  ) AS theo_cuoc
FROM nac n
LEFT JOIN tien_cuoc t ON t.nac = n.nac
GROUP BY n.nac
ORDER BY n.nac DESC;
