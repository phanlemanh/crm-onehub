WITH nac AS (
  SELECT unnest(ARRAY['bat', 'an', 'khong-ro']) AS nac
),
nhac AS (
  SELECT t.id,
    substring(t.subject from '^user:(.+):\d{4}-\d{2}-\d{2}$') AS user_id,
    substring(t.subject from '(\d{4}-\d{2}-\d{2})$') AS ngay,
    e AS muc
  FROM "agentTask" t,
    jsonb_array_elements(coalesce(t.payload -> 'daGui', '[]'::jsonb)) e
  WHERE t.kind = 'nhac-ke-hoach'
    AND e ->> 'loai' = 'okr-tom-tat'
    AND left(substring(t.subject from '(\d{4}-\d{2}-\d{2})$'), 7) = current_setting('okr.thang')
),
luot AS (
  SELECT n.id, n.user_id, n.ngay,
    n.muc ->> 'departmentId' AS phong,
    coalesce(b.cau ->> 'nac', 'khong-ro') AS nac
  FROM nhac n
  LEFT JOIN "okrTomTat" b ON b.id = n.muc ->> 'tomTatId'
),
mo AS (
  SELECT DISTINCT l.id, l.phong
  FROM luot l
  JOIN "okrTrail" v
    ON v.action = 'mo-hop-tuan'
   AND v."actorUserId" = l.user_id
   AND v.after ->> 'donVi' = 'pb:' || l.phong
   AND to_char(v.at + interval '7 hours', 'YYYY-MM-DD') = l.ngay
)
SELECT n.nac,
  count(l.id)::int AS nhan_dong,
  count(m.id)::int AS mo_trong_ngay,
  round(count(m.id)::numeric / nullif(count(l.id), 0), 4)::float AS ty_le_mo
FROM nac n
LEFT JOIN luot l ON l.nac = n.nac
LEFT JOIN mo m ON m.id = l.id AND m.phong = l.phong
GROUP BY n.nac
ORDER BY n.nac DESC;
