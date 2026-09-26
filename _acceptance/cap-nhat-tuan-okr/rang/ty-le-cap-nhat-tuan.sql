SELECT
	COALESCE(op."primaryDepartmentId", 'chua-xep') AS phong_ban,
	COUNT(DISTINCT k.id) AS mau_so,
	COUNT(DISTINCT k.id) FILTER (
		WHERE EXISTS (
			SELECT 1 FROM "okrCheckIn" c
			WHERE c."keyResultId" = k.id AND c."weekStart" = $1::date
		)
	) AS tu_so
FROM "okrKeyResult" k
JOIN "okrObjective" o ON o.id = k."objectiveId"
JOIN "okrCycle" cy ON cy.id = o."cycleId"
LEFT JOIN "orgPlacement" op ON op."userId" = k."ownerUserId"
WHERE o.status = 'cong-bo'
	AND cy.phase = 'dang-chay'
	AND o."publishedAt" < ($1::date + INTERVAL '7 day')
GROUP BY 1
ORDER BY 1;
