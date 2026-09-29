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
luot AS (
  SELECT t.id, coalesce(t.payload ->> 'nac', 'bat') AS nac
  FROM "agentTask" t, khung k
  WHERE t.kind = 'okr-de-xuat'
    AND t."createdAt" >= k.tu AND t."createdAt" < k.den
),
da_nhan AS (
  SELECT d.id, l.nac, d.loai, d.truong, d.truoc, d."objectiveId", d."keyResultId"
  FROM "okrDeXuat" d
  JOIN luot l ON l.id = d."taskId"
  WHERE d."trangThai" IN ('nhan', 'sua')
),
hoan_tac AS (
  SELECT DISTINCT n.id
  FROM da_nhan n
  JOIN "okrTrail" v ON v.note = 'tro-ly-okr:' || n.id
  JOIN "okrTrail" h
    ON h.at > v.at
   AND h.at <= v.at + interval '7 days'
   AND (
     (n.truong IN ('title', 'whyNow') AND h.action = 'sua'
       AND h."objectiveId" = n."objectiveId" AND h.after ->> n.truong = n.truoc)
     OR
     (n.truong = 'kr.title' AND h.action = 'sua-kr'
       AND h."keyResultId" = n."keyResultId" AND h.after ->> 'title' = n.truoc)
   )
  WHERE n.loai = 'viet-lai'
)
SELECT nac.nac,
  count(n.id)::int AS da_nhan,
  count(h.id)::int AS hoan_tac,
  round(count(h.id)::numeric / nullif(count(n.id), 0), 4)::float AS ty_le_hoan_tac
FROM nac
LEFT JOIN da_nhan n ON n.nac = nac.nac
LEFT JOIN hoan_tac h ON h.id = n.id
GROUP BY nac.nac
ORDER BY nac.nac DESC;
