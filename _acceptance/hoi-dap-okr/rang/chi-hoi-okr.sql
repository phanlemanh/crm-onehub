WITH phien_hoi AS (
  SELECT DISTINCT c."sessionId" AS sid, m.role
  FROM "okrCuocHoi" c
  JOIN member m ON m."userId" = c."nguoiHoiUserId"
  UNION
  SELECT DISTINCT p AS sid, m.role
  FROM "okrCuocHoi" c
  CROSS JOIN LATERAL unnest(c."cacPhien") AS p
  JOIN member m ON m."userId" = c."nguoiHoiUserId"
),
goi AS (
  SELECT ph.role, a->>'toolName' AS cong_cu
  FROM "agentEvent" e
  JOIN phien_hoi ph ON ph.sid = e."sessionId"
  CROSS JOIN LATERAL jsonb_array_elements(COALESCE(e.data->'actions', '[]'::jsonb)) AS a
  WHERE e.type = 'actions.requested'
)
SELECT role AS vai,
       count(*) FILTER (WHERE cong_cu NOT IN ('tim_okr', 'doc_okr', 'nop_tra_loi')) AS goi_ngoai_okr,
       count(*) AS tong_goi
FROM goi
GROUP BY role
ORDER BY role;
