### S4 round 1 — wf_0d672c7a-9a3 (31 agent, 115,584 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 26,651 | 4 | 97,303 | 229 |
| judge:E16:spec-alignment | claude-sonnet-5 | 2 | 11,270 | 4 | 107,941 | 110 |
| triage | claude-sonnet-5 | 2 | 10,712 | 4 | 78,169 | 106 |
| ui:E14 | claude-sonnet-5 | 18 | 8,998 | 36 | 1,797,185 | 202 |
| judge:E16:operational-feasibility | claude-sonnet-5 | 3 | 8,657 | 6 | 218,916 | 88 |
| judge:E16:domain-correctness | claude-sonnet-5 | 3 | 7,861 | 6 | 183,166 | 79 |
| review:measurement | claude-opus-5-5 | 19 | 4,131 | 38 | 2,382,520 | 225 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,577 | 18 | 77,215 | 44 |
| review:bugs | claude-opus-5-5 | 29 | 3,326 | 58 | 3,560,900 | 251 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,325 | 18 | 77,217 | 40 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,294 | 18 | 77,215 | 42 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,275 | 18 | 77,215 | 42 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,218 | 18 | 77,213 | 42 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,197 | 18 | 77,214 | 40 |
| review:conventions | claude-opus-5-5 | 20 | 2,386 | 40 | 2,135,394 | 163 |
| baseline:diffBase | claude-sonnet-5 | 27 | 2,122 | 54 | 2,404,747 | 289 |
| refute:chan.ts | claude-sonnet-5 | 7 | 1,491 | 14 | 478,587 | 49 |
| refute:chan.ts | claude-sonnet-5 | 11 | 1,232 | 22 | 848,328 | 62 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 984 | 18 | 77,182 | 19 |
| capture:provenance | claude-sonnet-5 | 2 | 953 | 4 | 71,204 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 880 | 42 | 268,064 | 30 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 510 | 18 | 49,993 | 312 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 476 | 18 | 77,215 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 411 | 18 | 77,215 | 21 |
| machine:cd apps/agent && CRM_TELEMETRY_DISABLED= | claude-haiku-4-5-20251001 | 2 | 401 | 18 | 77,218 | 14 |
| machine:cd apps/api && CRM_TELEMETRY_DISABLED=1 | claude-haiku-4-5-20251001 | 2 | 385 | 18 | 77,223 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 383 | 18 | 77,216 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 380 | 18 | 77,215 | 20 |
| machine:cd apps/api && CRM_TELEMETRY_DISABLED=1 | claude-haiku-4-5-20251001 | 2 | 377 | 18 | 77,223 | 12 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 369 | 18 | 77,182 | 23 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 352 | 18 | 77,180 | 13 |


wall: 788s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,122 | 2,404,747 | 289 | 05:09:26 | 05:14:15 |
| machine | 18 | 25,794 | 1,553,415 | 371 | 05:09:26 | 05:15:37 |
| ui | 1 | 8,998 | 1,797,185 | 202 | 05:09:50 | 05:13:11 |
| judge | 3 | 27,788 | 510,023 | 114 | 05:09:59 | 05:11:53 |
| review | 3 | 9,843 | 8,078,814 | 253 | 05:10:11 | 05:14:23 |
| triage | 1 | 10,712 | 78,169 | 106 | 05:15:39 | 05:17:24 |
| refute | 2 | 2,723 | 1,326,915 | 63 | 05:17:26 | 05:18:29 |
| capture | 1 | 953 | 71,204 | 14 | 05:18:30 | 05:18:44 |
| synthesize | 1 | 26,651 | 97,303 | 229 | 05:18:45 | 05:22:34 |

- **claude-sonnet-5**: 10 agent · 77 calls · out 79,947 · in 154 · cache_read 6,285,546 · cache_create 955,080
- **claude-opus-5-5**: 3 agent · 68 calls · out 9,843 · in 136 · cache_read 8,078,814 · cache_create 380,604
- **claude-haiku-4-5-20251001**: 18 agent · 39 calls · out 25,794 · in 348 · cache_read 1,553,415 · cache_create 553,908

