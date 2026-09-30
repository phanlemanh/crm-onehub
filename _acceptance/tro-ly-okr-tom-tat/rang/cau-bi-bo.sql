WITH nac AS (
  SELECT unnest(ARRAY['bat', 'an']) AS nac
),
ban AS (
  SELECT t.id, t.tuan, t."trangThai",
    coalesce(t.cau ->> 'nac', 'bat') AS nac,
    jsonb_array_length(coalesce(t.cau -> 'cau', '[]'::jsonb)) AS con_lai,
    t."soCauBo" AS bo,
    coalesce(t.cau -> 'bo', '[]'::jsonb) AS ds_bo
  FROM "okrTomTat" t
),
tuan AS (
  SELECT DISTINCT tuan FROM ban
)
SELECT to_char(w.tuan, 'YYYY-MM-DD') AS tuan,
  n.nac,
  count(b.id)::int AS so_ban,
  (count(b.id) FILTER (WHERE b."trangThai" = 'can-xem'))::int AS can_xem,
  coalesce(sum(b.con_lai + b.bo), 0)::int AS tong_cau,
  coalesce(sum(b.bo), 0)::int AS cau_bo,
  round(sum(b.bo)::numeric / nullif(sum(b.con_lai + b.bo), 0), 4)::float AS ty_le_bo,
  coalesce(
    (SELECT jsonb_object_agg(x.ma, x.so)
     FROM (
       SELECT e ->> 'maBo' AS ma, count(*)::int AS so
       FROM ban b2, jsonb_array_elements(b2.ds_bo) e
       WHERE b2.tuan = w.tuan AND b2.nac = n.nac
       GROUP BY 1
     ) x),
    '{}'::jsonb
  ) AS theo_ma
FROM tuan w
CROSS JOIN nac n
LEFT JOIN ban b ON b.tuan = w.tuan AND b.nac = n.nac
GROUP BY w.tuan, n.nac
ORDER BY w.tuan DESC, n.nac DESC;
