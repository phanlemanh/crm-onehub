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
phan_hoi AS (
  SELECT p.id, p."huuIch", coalesce(t.cau ->> 'nac', 'bat') AS nac
  FROM "okrTomTatPhanHoi" p
  JOIN "okrTomTat" t ON t.id = p."tomTatId", khung k
  WHERE p.luc >= k.tu AND p.luc < k.den
)
SELECT n.nac,
  count(p.id)::int AS phan_hoi,
  (count(p.id) FILTER (WHERE p."huuIch"))::int AS huu_ich,
  (count(p.id) FILTER (WHERE NOT p."huuIch"))::int AS khong_huu_ich,
  round(
    (count(p.id) FILTER (WHERE p."huuIch"))::numeric / nullif(count(p.id), 0),
    4
  )::float AS ty_le_huu_ich
FROM nac n
LEFT JOIN phan_hoi p ON p.nac = n.nac
GROUP BY n.nac
ORDER BY n.nac DESC;
