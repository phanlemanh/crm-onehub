### S4 round 1 — wf_ae39feb2-6ae (35 agent, 77,689 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 15,218 | 8 | 185,993 | 86 |
| review:measurement | claude-opus-5-5 | 26 | 8,228 | 52 | 2,164,652 | 227 |
| triage | claude-sonnet-5-5 | 4 | 7,035 | 8 | 111,441 | 45 |
| review:invariants | claude-opus-5-5 | 29 | 4,161 | 58 | 2,142,024 | 200 |
| judge:E12:spec-alignment | claude-sonnet-5-5 | 5 | 3,470 | 10 | 137,107 | 27 |
| judge:E12:domain-correctness | claude-sonnet-5-5 | 4 | 3,314 | 8 | 92,381 | 23 |
| judge:E12:operational-feasibility | claude-sonnet-5-5 | 5 | 2,990 | 10 | 137,057 | 27 |
| review:bugs | claude-opus-5-5 | 28 | 2,358 | 56 | 2,026,377 | 194 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 2,285 | 4 | 25,407 | 17 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,007 | 4 | 25,392 | 283 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,862 | 4 | 25,367 | 9 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,806 | 4 | 25,422 | 63 |
| ui:E11 | claude-sonnet-5-5 | 5 | 1,747 | 10 | 308,938 | 59 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,745 | 4 | 22,476 | 265 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,615 | 4 | 25,383 | 254 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,553 | 4 | 25,379 | 16 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,487 | 4 | 25,382 | 15 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,460 | 4 | 25,375 | 34 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,364 | 4 | 25,381 | 15 |
| refute:viec-chep-lenh.spec.ts | claude-sonnet-5-5 | 7 | 1,230 | 14 | 176,365 | 27 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,221 | 4 | 25,391 | 14 |
| refute:quet-task.mjs | claude-sonnet-5-5 | 6 | 1,199 | 12 | 136,751 | 29 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,117 | 4 | 25,408 | 14 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,061 | 4 | 25,365 | 19 |
| refute:viec-chep.spec.ts | claude-sonnet-5-5 | 5 | 978 | 10 | 116,798 | 19 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 778 | 4 | 25,395 | 13 |
| machine:node _acceptance/chep-viec-can-lam-cu/ra | claude-haiku-5-5 | 2 | 716 | 4 | 25,379 | 47 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 625 | 4 | 25,402 | 13 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 622 | 4 | 25,384 | 13 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 605 | 4 | 32,016 | 52 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 464 | 4 | 25,437 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 460 | 4 | 25,361 | 6 |
| machine:node _acceptance/chep-viec-can-lam-cu/ra | claude-haiku-5-5 | 2 | 439 | 4 | 25,378 | 9 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 315 | 4 | 25,415 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 154 | 4 | 21,293 | 5 |


wall: 1090s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 605 | 32,016 | 52 | 17:02:07 | 17:02:59 |
| machine | 21 | 25,002 | 530,279 | 914 | 17:02:07 | 17:17:21 |
| ui | 1 | 1,747 | 308,938 | 59 | 17:02:21 | 17:03:20 |
| judge | 3 | 9,774 | 366,545 | 29 | 17:02:21 | 17:02:51 |
| review | 3 | 14,747 | 6,333,053 | 227 | 17:02:24 | 17:06:12 |
| triage | 1 | 7,035 | 111,441 | 45 | 17:17:23 | 17:18:09 |
| refute | 3 | 3,407 | 429,914 | 31 | 17:18:11 | 17:18:41 |
| capture | 1 | 154 | 21,293 | 5 | 17:18:44 | 17:18:49 |
| synthesize | 1 | 15,218 | 185,993 | 86 | 17:18:51 | 17:20:17 |

- **claude-sonnet-5-5**: 11 agent · 49 calls · out 37,940 · in 98 · cache_read 1,456,140 · cache_create 477,727
- **claude-opus-5-5**: 3 agent · 83 calls · out 14,747 · in 166 · cache_read 6,333,053 · cache_create 347,134
- **claude-haiku-5-5**: 21 agent · 42 calls · out 25,002 · in 84 · cache_read 530,279 · cache_create 515,327

### S4 round 2 — wf_de258c39-511 (29 agent, 63,654 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 14,289 | 6 | 117,986 | 86 |
| review:invariants | claude-opus-5-5 | 32 | 6,308 | 64 | 2,302,201 | 202 |
| review:measurement | claude-opus-5-5 | 17 | 4,183 | 34 | 1,052,254 | 138 |
| triage | claude-sonnet-5-5 | 2 | 3,958 | 4 | 28,229 | 25 |
| judge:E12:domain-correctness | claude-sonnet-5-5 | 5 | 3,350 | 10 | 138,166 | 23 |
| judge:E12:spec-alignment | claude-sonnet-5-5 | 4 | 2,754 | 8 | 93,378 | 18 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,129 | 4 | 25,566 | 66 |
| judge:E12:operational-feasibility | claude-sonnet-5-5 | 4 | 2,063 | 8 | 92,010 | 18 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,016 | 4 | 25,536 | 285 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,926 | 4 | 25,573 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,757 | 4 | 25,511 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,707 | 4 | 22,642 | 274 |
| review:bugs | claude-opus-5-5 | 40 | 1,671 | 80 | 2,977,753 | 232 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,647 | 4 | 25,545 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 1,537 | 4 | 25,568 | 14 |
| machine:node _acceptance/chep-viec-can-lam-cu/ra | claude-haiku-5-5 | 2 | 1,533 | 4 | 25,545 | 56 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,516 | 4 | 25,527 | 259 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 1,264 | 4 | 25,581 | 13 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,223 | 4 | 25,548 | 13 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,186 | 4 | 25,550 | 13 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,176 | 4 | 25,561 | 13 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,172 | 4 | 25,509 | 33 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,121 | 4 | 25,541 | 31 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 535 | 4 | 31,019 | 44 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 488 | 4 | 25,603 | 9 |
| machine:node _acceptance/chep-viec-can-lam-cu/ra | claude-haiku-5-5 | 2 | 439 | 4 | 25,544 | 7 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 350 | 4 | 25,547 | 10 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 25,505 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 143 | 4 | 21,437 | 6 |


wall: 1073s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 535 | 31,019 | 44 | 03:18:23 | 03:19:07 |
| machine | 19 | 24,400 | 482,502 | 949 | 03:18:23 | 03:34:12 |
| judge | 3 | 8,167 | 323,554 | 30 | 03:18:23 | 03:18:53 |
| review | 3 | 12,162 | 6,332,208 | 233 | 03:18:36 | 03:22:29 |
| triage | 1 | 3,958 | 28,229 | 25 | 03:34:15 | 03:34:39 |
| capture | 1 | 143 | 21,437 | 6 | 03:34:42 | 03:34:47 |
| synthesize | 1 | 14,289 | 117,986 | 86 | 03:34:49 | 03:36:16 |

- **claude-sonnet-5-5**: 7 agent · 22 calls · out 27,092 · in 44 · cache_read 522,225 · cache_create 288,347
- **claude-opus-5-5**: 3 agent · 89 calls · out 12,162 · in 178 · cache_read 6,332,208 · cache_create 321,403
- **claude-haiku-5-5**: 19 agent · 38 calls · out 24,400 · in 76 · cache_read 482,502 · cache_create 449,547

