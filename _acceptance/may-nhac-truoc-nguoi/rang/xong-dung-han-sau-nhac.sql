WITH gui AS (
  SELECT DISTINCT (m->>'stepId') AS step_id
  FROM "agentTask" t, jsonb_array_elements(t.payload->'daGui') m
  WHERE t.kind = 'nhac-ke-hoach' AND t.outcome LIKE 'da-gui%'
    AND m->>'loai' = 'buoc-sap-han'
    AND t."createdAt" >= ($1::timestamptz AT TIME ZONE 'UTC')
    AND t."createdAt" < ($2::timestamptz AT TIME ZONE 'UTC')
)
SELECT
  COUNT(*) FILTER (WHERE s."completedAt" IS NOT NULL
    AND ((s."completedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
        <= ((s."dueAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)::int AS dung,
  COUNT(*)::int AS mau
FROM gui JOIN "onboardingStep" s ON s.id = gui.step_id
