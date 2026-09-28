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
  SELECT t.id, coalesce(t.payload ->> 'nac', 'bat') AS nac, t."sessionId"
  FROM "agentTask" t, khung k
  WHERE t.kind = 'okr-de-xuat'
    AND t."createdAt" >= k.tu AND t."createdAt" < k.den
),
tien AS (
  SELECT l.nac, sum(c."costUsd") AS usd
  FROM luot l
  JOIN "aiChiPhi" c
    ON c."taskId" = l.id
    OR (c."taskId" IS NULL AND l."sessionId" IS NOT NULL
        AND (c."sessionId" = l."sessionId" OR c."phienCha" = l."sessionId"))
  GROUP BY l.nac
),
nhan AS (
  SELECT l.nac, count(*)::int AS so
  FROM "okrDeXuat" d
  JOIN luot l ON l.id = d."taskId"
  WHERE d."trangThai" IN ('nhan', 'sua')
  GROUP BY l.nac
),
so_luot AS (
  SELECT nac, count(*)::int AS so FROM luot GROUP BY nac
),
ngay AS (
  SELECT to_char(c.at + interval '7 hours', 'YYYY-MM-DD') AS ngay, sum(c."costUsd") AS usd
  FROM "aiChiPhi" c, khung k
  WHERE c."tinhNang" LIKE 'okr.%' AND c.at >= k.tu AND c.at < k.den
  GROUP BY 1
),
luy_ke AS (
  SELECT ngay, sum(usd) OVER (ORDER BY ngay) AS usd FROM ngay
),
tran AS (
  SELECT "aiTranThangUsd" AS usd
  FROM "okrProgramConfig"
  ORDER BY "createdAt" DESC, version DESC
  LIMIT 1
)
SELECT n.nac,
  coalesce(sl.so, 0) AS so_luot,
  coalesce(nh.so, 0) AS so_nhan,
  round(coalesce(t.usd, 0), 6)::float AS tien_usd,
  round(coalesce(t.usd, 0) / nullif(coalesce(nh.so, 0), 0), 6)::float AS chi_phi_moi_nhan_usd,
  round(coalesce(t.usd, 0) / nullif(coalesce(sl.so, 0), 0), 6)::float AS chi_phi_moi_luot_usd,
  (SELECT min(lk.ngay) FROM luy_ke lk, tran WHERE lk.usd >= tran.usd) AS ngay_cham_tran
FROM nac n
LEFT JOIN tien t ON t.nac = n.nac
LEFT JOIN nhan nh ON nh.nac = n.nac
LEFT JOIN so_luot sl ON sl.nac = n.nac
ORDER BY n.nac DESC;
