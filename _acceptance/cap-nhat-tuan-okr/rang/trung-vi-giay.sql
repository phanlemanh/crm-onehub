SELECT
	percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds) AS trung_vi
FROM "okrCheckInSession"
WHERE "submittedAt" IS NOT NULL
	AND "submittedAt" >= $1::timestamptz
	AND "submittedAt" < $2::timestamptz;
