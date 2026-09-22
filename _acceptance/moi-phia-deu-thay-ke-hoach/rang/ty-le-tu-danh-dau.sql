SELECT
  COUNT(*) FILTER (
    WHERE meta->>'giaoLucXong' IS NOT NULL
      AND "createdById" = meta->>'giaoLucXong'
  )::int AS tu_danh_dau,
  COUNT(*) FILTER (WHERE meta->>'giaoLucXong' IS NOT NULL)::int AS mau,
  COUNT(*) FILTER (WHERE meta->>'giaoLucXong' IS NULL)::int AS khong_giao
FROM "activity"
WHERE type = 'PLAN_CHANGE'
  AND meta->>'kind' = 'buoc.xong'
  AND meta ? 'giaoLucXong'
  AND "createdAt" >= $1
  AND "createdAt" < $2
