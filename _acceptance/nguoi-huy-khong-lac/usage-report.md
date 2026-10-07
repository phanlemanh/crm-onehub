### S4 round 1 — wf_37c98315-998 (17 agent, 47,214 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 6 | 9,876 | 12 | 571,152 | 107 |
| review:bugs | claude-opus-5-5 | 11 | 7,911 | 22 | 1,175,385 | 102 |
| review:conventions | claude-opus-5-5 | 6 | 4,953 | 12 | 541,958 | 62 |
| synthesize:report | claude-sonnet-5-5 | 3 | 4,316 | 6 | 212,413 | 33 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 5 | 2,860 | 42 | 314,391 | 468 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,649 | 18 | 94,044 | 82 |
| baseline:diffBase | claude-sonnet-5-5 | 7 | 2,626 | 14 | 593,360 | 41 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,922 | 18 | 67,330 | 211 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,895 | 18 | 94,012 | 204 |
| triage | claude-sonnet-5-5 | 2 | 1,461 | 4 | 92,803 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,445 | 18 | 93,997 | 19 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 1,226 | 18 | 94,054 | 16 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,077 | 18 | 93,995 | 14 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 1,035 | 18 | 94,051 | 15 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 903 | 18 | 94,056 | 15 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 726 | 18 | 93,997 | 27 |
| capture:provenance | claude-sonnet-5-5 | 2 | 333 | 4 | 90,457 | 7 |


wall: 1080s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,626 | 593,360 | 41 | 06:05:05 | 06:05:47 |
| machine | 10 | 15,738 | 1,133,927 | 1025 | 06:05:05 | 06:22:10 |
| review | 3 | 22,740 | 2,288,495 | 109 | 06:05:05 | 06:06:54 |
| triage | 1 | 1,461 | 92,803 | 15 | 06:22:10 | 06:22:25 |
| capture | 1 | 333 | 90,457 | 7 | 06:22:26 | 06:22:32 |
| synthesize | 1 | 4,316 | 212,413 | 33 | 06:22:32 | 06:23:05 |

- **claude-opus-5-5**: 3 agent · 23 calls · out 22,740 · in 46 · cache_read 2,288,495 · cache_create 306,382
- **claude-sonnet-5-5**: 4 agent · 14 calls · out 8,736 · in 28 · cache_read 989,033 · cache_create 413,226
- **claude-haiku-4-5-20251001**: 10 agent · 23 calls · out 15,738 · in 204 · cache_read 1,133,927 · cache_create 504,761

