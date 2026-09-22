SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY im)::float AS trung_vi
FROM (
  SELECT (($1::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
          - ((COALESCE(MAX(s."updatedAt"), p."startedAt") AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) AS im
  FROM "onboardingPlan" p
  LEFT JOIN "onboardingStep" s ON s."planId" = p.id
  WHERE p."closedAt" IS NULL
  GROUP BY p.id, p."startedAt"
) t
