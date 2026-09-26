SELECT u.id
FROM "user" u
WHERE (
	EXISTS (SELECT 1 FROM "zaloLink" z WHERE z."crmUserId" = u.id)
	OR EXISTS (SELECT 1 FROM "slackMemberMatch" s WHERE s."crmUserId" = u.id)
)
AND EXISTS (
	SELECT 1 FROM "okrKeyResult" k
	JOIN "okrObjective" o ON o.id = k."objectiveId"
	JOIN "okrCycle" cy ON cy.id = o."cycleId"
	WHERE k."ownerUserId" = u.id AND o.status = 'cong-bo' AND cy.phase = 'dang-chay'
)
AND NOT EXISTS (
	SELECT 1 FROM "agentTask" a
	WHERE a.kind = 'nhac-ke-hoach'
		AND a.subject = 'user:' || u.id || ':' || $1::text
		AND a.outcome LIKE 'da-gui%'
		AND a.payload -> 'daGui' @> '[{"loai":"okr-cap-nhat"}]'
)
ORDER BY u.id;
