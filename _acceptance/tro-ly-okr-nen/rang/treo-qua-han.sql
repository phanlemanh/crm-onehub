select t.id, t.kind, t."startedAt", t."finishedAt", t.outcome
from "agentTask" t
where t.kind like 'okr-%'
	and t."startedAt" is not null
	and (
		(t."finishedAt" is null and t."startedAt" < (now() at time zone 'UTC') - interval '90 seconds')
		or t."finishedAt" - t."startedAt" > interval '90 seconds'
		or t.outcome = 'ran'
	);
