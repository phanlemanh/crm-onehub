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

### S4 round 2 — wf_357dfc62-5c5 (28 agent, 99,975 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 27,471 | 4 | 95,098 | 234 |
| judge:E16:domain-correctness | claude-sonnet-5 | 2 | 19,739 | 4 | 72,121 | 187 |
| judge:E16:spec-alignment | claude-sonnet-5 | 2 | 11,064 | 4 | 108,078 | 114 |
| judge:E16:operational-feasibility | claude-sonnet-5 | 2 | 9,617 | 4 | 108,080 | 93 |
| ui:E14 | claude-sonnet-5 | 26 | 7,338 | 52 | 3,223,935 | 222 |
| triage | claude-sonnet-5 | 2 | 6,792 | 4 | 74,900 | 71 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,307 | 18 | 77,230 | 43 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,880 | 18 | 77,209 | 42 |
| baseline:diffBase | claude-sonnet-5 | 37 | 2,020 | 74 | 3,467,152 | 327 |
| review:measurement | claude-opus-5-5 | 8 | 1,421 | 16 | 636,095 | 106 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 997 | 18 | 77,209 | 21 |
| review:bugs | claude-opus-5-5 | 6 | 920 | 12 | 444,180 | 89 |
| review:conventions | claude-opus-5-5 | 4 | 919 | 8 | 230,881 | 41 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 512 | 18 | 77,230 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 489 | 18 | 77,230 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 451 | 18 | 77,232 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 445 | 18 | 77,228 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 429 | 18 | 77,229 | 19 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 423 | 18 | 77,189 | 303 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 388 | 18 | 77,207 | 15 |
| machine:cd apps/api && CRM_TELEMETRY_DISABLED=1 | claude-haiku-4-5-20251001 | 2 | 384 | 18 | 77,238 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 362 | 18 | 77,230 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 314 | 18 | 77,231 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 312 | 18 | 77,230 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 298 | 18 | 77,230 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 292 | 18 | 77,231 | 20 |
| machine:cd apps/api && CRM_TELEMETRY_DISABLED=1 | claude-haiku-4-5-20251001 | 2 | 243 | 18 | 77,238 | 12 |
| capture:provenance | claude-sonnet-5 | 2 | 148 | 4 | 71,239 | 8 |


wall: 701s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,020 | 3,467,152 | 327 | 05:25:19 | 05:30:46 |
| machine | 17 | 12,526 | 1,312,821 | 384 | 05:25:19 | 05:31:44 |
| ui | 1 | 7,338 | 3,223,935 | 222 | 05:25:41 | 05:29:23 |
| judge | 3 | 40,420 | 288,279 | 187 | 05:25:41 | 05:28:49 |
| review | 3 | 3,260 | 1,311,156 | 116 | 05:25:45 | 05:27:41 |
| triage | 1 | 6,792 | 74,900 | 71 | 05:31:45 | 05:32:56 |
| capture | 1 | 148 | 71,239 | 8 | 05:32:57 | 05:33:05 |
| synthesize | 1 | 27,471 | 95,098 | 234 | 05:33:06 | 05:37:00 |

- **claude-sonnet-5**: 8 agent · 75 calls · out 84,189 · in 150 · cache_read 7,220,603 · cache_create 817,995
- **claude-haiku-4-5-20251001**: 17 agent · 34 calls · out 12,526 · in 306 · cache_read 1,312,821 · cache_create 487,188
- **claude-opus-5-5**: 3 agent · 18 calls · out 3,260 · in 36 · cache_read 1,311,156 · cache_create 211,799

