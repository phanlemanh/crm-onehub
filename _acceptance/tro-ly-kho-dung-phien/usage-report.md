### S4 round 1 — wf_d7d1af67-953 (22 agent, 67,828 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 7 | 11,474 | 14 | 898,217 | 123 |
| review:conventions | claude-opus-5-5 | 18 | 10,829 | 36 | 2,590,651 | 143 |
| synthesize:report | claude-sonnet-5-5 | 3 | 7,072 | 6 | 280,470 | 54 |
| review:bugs | claude-opus-5-5 | 13 | 6,447 | 26 | 1,725,711 | 89 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,701 | 18 | 121,805 | 54 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 3,580 | 20 | 1,161,492 | 76 |
| triage | claude-sonnet-5-5 | 2 | 3,318 | 4 | 122,455 | 32 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 2,422 | 18 | 121,845 | 28 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,382 | 18 | 121,852 | 80 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 4 | 2,307 | 34 | 318,460 | 449 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,181 | 18 | 121,826 | 212 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,899 | 18 | 121,820 | 190 |
| refute:model.ts | claude-sonnet-5-5 | 4 | 1,617 | 8 | 379,062 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,316 | 18 | 121,805 | 17 |
| machine:bun run test -- "bun test _acceptance/tr | claude-haiku-4-5-20251001 | 2 | 1,194 | 18 | 121,842 | 26 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,053 | 18 | 121,848 | 31 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,047 | 18 | 121,848 | 17 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 970 | 18 | 121,803 | 16 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 918 | 18 | 121,848 | 19 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 897 | 18 | 121,868 | 26 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 881 | 18 | 121,846 | 17 |
| capture:provenance | claude-sonnet-5-5 | 2 | 323 | 4 | 117,578 | 9 |


wall: 1135s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,580 | 1,161,492 | 76 | 16:34:35 | 16:35:51 |
| machine | 14 | 23,168 | 1,902,316 | 1018 | 16:34:35 | 16:51:33 |
| review | 3 | 28,750 | 5,214,579 | 143 | 16:34:35 | 16:36:58 |
| triage | 1 | 3,318 | 122,455 | 32 | 16:51:33 | 16:52:06 |
| refute | 1 | 1,617 | 379,062 | 22 | 16:52:06 | 16:52:28 |
| capture | 1 | 323 | 117,578 | 9 | 16:52:28 | 16:52:37 |
| synthesize | 1 | 7,072 | 280,470 | 54 | 16:52:37 | 16:53:31 |

- **claude-opus-5-5**: 3 agent · 38 calls · out 28,750 · in 76 · cache_read 5,214,579 · cache_create 413,371
- **claude-sonnet-5-5**: 5 agent · 21 calls · out 15,910 · in 42 · cache_read 2,061,057 · cache_create 671,177
- **claude-haiku-4-5-20251001**: 14 agent · 30 calls · out 23,168 · in 268 · cache_read 1,902,316 · cache_create 980,147

