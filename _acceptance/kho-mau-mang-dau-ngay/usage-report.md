### S4 round 1 — wf_450eed4f-990 (25 agent, 32,916 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 5,475 | 8 | 341,354 | 46 |
| review:measurement | claude-opus-5-5 | 5 | 3,627 | 10 | 458,529 | 91 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,835 | 18 | 94,066 | 47 |
| review:bugs | claude-opus-5-5 | 21 | 2,521 | 42 | 2,498,838 | 157 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,874 | 18 | 94,113 | 84 |
| triage | claude-sonnet-5-5 | 2 | 1,846 | 4 | 125,824 | 18 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 1,586 | 18 | 94,087 | 236 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 3 | 1,498 | 6 | 224,608 | 19 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 3 | 1,403 | 6 | 192,621 | 20 |
| baseline:diffBase | claude-sonnet-5-5 | 13 | 1,193 | 26 | 1,247,382 | 152 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 3 | 1,116 | 6 | 224,612 | 22 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 912 | 18 | 94,081 | 201 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 910 | 18 | 94,097 | 25 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 868 | 18 | 94,066 | 18 |
| review:conventions | claude-opus-5-5 | 8 | 860 | 16 | 789,454 | 64 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 838 | 18 | 94,098 | 24 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 652 | 18 | 94,098 | 23 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 613 | 18 | 94,092 | 32 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 604 | 18 | 94,098 | 22 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 436 | 18 | 94,097 | 47 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 398 | 18 | 94,068 | 210 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 355 | 18 | 94,092 | 30 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 338 | 18 | 94,064 | 12 |
| capture:provenance | claude-sonnet-5-5 | 2 | 155 | 4 | 90,271 | 8 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-4-5-20251001 | 2 | 3 | 18 | 94,095 | 49 |


wall: 899s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,193 | 1,247,382 | 152 | 23:15:33 | 23:18:06 |
| machine | 15 | 13,222 | 1,411,312 | 821 | 23:15:33 | 23:29:14 |
| judge | 3 | 4,017 | 641,841 | 42 | 23:15:33 | 23:16:15 |
| review | 3 | 7,008 | 3,746,821 | 159 | 23:15:59 | 23:18:37 |
| triage | 1 | 1,846 | 125,824 | 18 | 23:29:16 | 23:29:35 |
| capture | 1 | 155 | 90,271 | 8 | 23:29:37 | 23:29:45 |
| synthesize | 1 | 5,475 | 341,354 | 46 | 23:29:46 | 23:30:33 |

- **claude-sonnet-5-5**: 7 agent · 30 calls · out 12,686 · in 60 · cache_read 2,446,672 · cache_create 648,282
- **claude-opus-5-5**: 3 agent · 34 calls · out 7,008 · in 68 · cache_read 3,746,821 · cache_create 321,512
- **claude-haiku-4-5-20251001**: 15 agent · 30 calls · out 13,222 · in 270 · cache_read 1,411,312 · cache_create 697,263

