WITH khoang AS (
  SELECT
    (current_setting('okr.tu')::date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'UTC' AS tu,
    ((current_setting('okr.den')::date + 1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'UTC' AS den
),
thanh_vien AS (
  SELECT DISTINCT lower(u.email) AS email
  FROM member m
  JOIN "user" u ON u.id = m."userId"
)
SELECT
  (
    SELECT count(*) FROM deal d, khoang k
    WHERE d.stage = 'CLOSED_WON'
      AND d."archivedAt" IS NULL
      AND d."closedAt" >= k.tu AND d."closedAt" < k.den
  )::int AS chot,
  (
    SELECT count(*) FROM deal d, khoang k
    WHERE d."archivedAt" IS NULL
      AND d."createdAt" >= k.tu AND d."createdAt" < k.den
  )::int AS moi,
  (
    SELECT count(*) FROM "campaignTouch" t, khoang k
    WHERE t.outcome = 'MEETING'
      AND t."createdAt" >= k.tu AND t."createdAt" < k.den
  )::int AS hen,
  (
    SELECT count(*) FROM "onboardingStep" s, khoang k
    WHERE s."completedAt" >= k.tu AND s."completedAt" < k.den
      AND s."completedAt" <= s."dueAt"
  )::int AS buoc,
  (
    SELECT count(*) FROM "emailMessage" e, khoang k
    WHERE e."sentAt" >= k.tu AND e."sentAt" < k.den
      AND lower(e."fromEmail") IN (SELECT email FROM thanh_vien)
  )::int AS thu;
