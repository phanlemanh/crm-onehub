### S4 round 1 — wf_2b7bc912-266 (41 agent, 78,054 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 18,346 | 6 | 149,744 | 121 |
| triage | claude-sonnet-5-5 | 2 | 8,349 | 4 | 42,643 | 53 |
| review:measurement | claude-opus-5-5 | 26 | 4,775 | 52 | 2,519,748 | 265 |
| review:bugs | claude-opus-5-5 | 25 | 4,453 | 50 | 2,149,454 | 222 |
| machine:node _acceptance/ke-hoach-sinh-viec/rang | claude-haiku-5-5 | 2 | 3,805 | 4 | 35,657 | 21 |
| judge:E14:operational-feasibility | claude-sonnet-5-5 | 5 | 3,629 | 10 | 231,030 | 29 |
| judge:E14:spec-alignment | claude-sonnet-5-5 | 4 | 3,605 | 8 | 164,077 | 26 |
| review:conventions | claude-opus-5-5 | 24 | 3,304 | 48 | 2,040,355 | 144 |
| judge:E14:domain-correctness | claude-sonnet-5-5 | 4 | 3,243 | 8 | 164,357 | 25 |
| ui:E3b | claude-sonnet-5-5 | 4 | 2,704 | 8 | 263,322 | 68 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,993 | 4 | 35,612 | 68 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,754 | 4 | 35,573 | 61 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,545 | 4 | 35,557 | 11 |
| refute:tao-ke-hoach.tsx | claude-sonnet-5-5 | 6 | 1,483 | 12 | 185,317 | 29 |
| refute:dong-mo-ke-hoach.tsx | claude-sonnet-5-5 | 7 | 1,375 | 14 | 223,861 | 32 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,322 | 4 | 35,557 | 287 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,103 | 4 | 35,597 | 16 |
| refute:buoc-viec-chieu.ts | claude-sonnet-5-5 | 10 | 1,015 | 20 | 389,165 | 45 |
| refute:ke-hoach-sinh-viec.spec.ts | claude-sonnet-5-5 | 8 | 844 | 16 | 275,301 | 32 |
| refute:khong-xoa-expect.mjs | claude-sonnet-5-5 | 3 | 805 | 6 | 71,085 | 14 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 779 | 4 | 35,626 | 17 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 763 | 4 | 35,551 | 10 |
| refute:ke-hoach-sinh-viec.spec.ts | claude-sonnet-5-5 | 5 | 716 | 10 | 151,633 | 31 |
| refute:khong-xoa-expect.mjs | claude-sonnet-5-5 | 3 | 692 | 6 | 71,165 | 24 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 675 | 4 | 42,582 | 56 |
| machine:node _acceptance/ke-hoach-sinh-viec/rang | claude-haiku-5-5 | 2 | 605 | 4 | 35,591 | 58 |
| refute:ke-hoach-sinh-viec.spec.ts | claude-sonnet-5-5 | 4 | 570 | 8 | 109,212 | 21 |
| machine:node _acceptance/ke-hoach-sinh-viec/rang | claude-haiku-5-5 | 2 | 524 | 4 | 35,592 | 19 |
| refute:ke-hoach-sinh-viec-do-nguong.spec.ts | claude-sonnet-5-5 | 3 | 399 | 6 | 70,296 | 16 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 379 | 4 | 35,582 | 264 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 355 | 4 | 35,625 | 14 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 301 | 4 | 35,631 | 14 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 274 | 4 | 35,627 | 13 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 233 | 4 | 35,622 | 15 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 233 | 4 | 35,622 | 14 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 211 | 4 | 35,629 | 14 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 201 | 4 | 35,555 | 32 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 195 | 4 | 35,648 | 11 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 193 | 4 | 35,625 | 14 |
| machine:node _acceptance/ke-hoach-sinh-viec/rang | claude-haiku-5-5 | 2 | 152 | 4 | 35,594 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 152 | 4 | 31,481 | 7 |


wall: 987s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 675 | 42,582 | 56 | 16:50:55 | 16:51:50 |
| machine | 21 | 16,920 | 747,673 | 748 | 16:50:55 | 17:03:23 |
| ui | 1 | 2,704 | 263,322 | 68 | 16:51:10 | 16:52:19 |
| judge | 3 | 10,477 | 559,464 | 31 | 16:51:11 | 16:51:42 |
| review | 3 | 12,532 | 6,709,557 | 266 | 16:51:13 | 16:55:39 |
| triage | 1 | 8,349 | 42,643 | 53 | 17:03:25 | 17:04:19 |
| refute | 9 | 7,899 | 1,547,035 | 47 | 17:04:21 | 17:05:08 |
| capture | 1 | 152 | 31,481 | 7 | 17:05:11 | 17:05:18 |
| synthesize | 1 | 18,346 | 149,744 | 121 | 17:05:21 | 17:07:22 |

- **claude-sonnet-5-5**: 17 agent · 75 calls · out 48,602 · in 150 · cache_read 2,636,271 · cache_create 869,503
- **claude-opus-5-5**: 3 agent · 75 calls · out 12,532 · in 150 · cache_read 6,709,557 · cache_create 374,369
- **claude-haiku-5-5**: 21 agent · 42 calls · out 16,920 · in 84 · cache_read 747,673 · cache_create 722,908


### S4 round 2 — wf_9bc0af4c-be5 — wf_9bc0af4c-be5 (31 agent, 59,503 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 16,857 | 10 | 273,078 | 110 |
| review:measurement | claude-opus-5-5 | 19 | 4,526 | 38 | 1,252,595 | 159 |
| machine:node _acceptance/ke-hoach-sinh-viec/rang | claude-haiku-5-5 | 2 | 3,576 | 4 | 33,392 | 38 |
| triage | claude-sonnet-5-5 | 2 | 3,365 | 4 | 35,238 | 23 |
| judge:E14:operational-feasibility | claude-sonnet-5-5 | 5 | 3,182 | 10 | 223,369 | 25 |
| judge:E14:domain-correctness | claude-sonnet-5-5 | 4 | 3,148 | 8 | 152,260 | 23 |
| ui:E3b | claude-sonnet-5-5 | 5 | 3,073 | 10 | 351,658 | 60 |
| judge:E14:spec-alignment | claude-sonnet-5-5 | 4 | 2,788 | 8 | 157,102 | 25 |
| review:conventions | claude-opus-5-5 | 28 | 2,099 | 56 | 2,081,236 | 142 |
| review:bugs | claude-opus-5-5 | 44 | 2,096 | 88 | 3,564,982 | 230 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,904 | 4 | 33,317 | 274 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,810 | 4 | 33,292 | 12 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,419 | 4 | 33,347 | 65 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,285 | 4 | 33,360 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,231 | 4 | 33,332 | 16 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 1,114 | 4 | 33,362 | 17 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 868 | 4 | 33,364 | 15 |
| refute:man.mjs | claude-sonnet-5-5 | 3 | 851 | 6 | 65,912 | 14 |
| machine:node _acceptance/ke-hoach-sinh-viec/rang | claude-haiku-5-5 | 2 | 609 | 4 | 33,326 | 55 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 590 | 4 | 39,145 | 50 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 403 | 4 | 33,290 | 22 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 400 | 4 | 33,308 | 272 |
| machine:node _acceptance/ke-hoach-sinh-viec/rang | claude-haiku-5-5 | 2 | 382 | 4 | 33,329 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 369 | 4 | 33,383 | 11 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 287 | 4 | 33,357 | 14 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 265 | 4 | 33,361 | 16 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 255 | 4 | 30,423 | 279 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 253 | 4 | 33,357 | 15 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 192 | 4 | 33,286 | 7 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 157 | 4 | 33,360 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 29,216 | 6 |


wall: 1113s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 590 | 39,145 | 50 | 22:50:39 | 22:51:29 |
| machine | 19 | 16,779 | 630,546 | 947 | 22:50:39 | 23:06:26 |
| ui | 1 | 3,073 | 351,658 | 60 | 22:50:39 | 22:51:39 |
| judge | 3 | 9,118 | 532,731 | 40 | 22:50:39 | 22:51:19 |
| review | 3 | 8,721 | 6,898,813 | 231 | 22:50:56 | 22:54:48 |
| triage | 1 | 3,365 | 35,238 | 23 | 23:06:28 | 23:06:52 |
| refute | 1 | 851 | 65,912 | 14 | 23:06:57 | 23:07:11 |
| capture | 1 | 149 | 29,216 | 6 | 23:07:13 | 23:07:19 |
| synthesize | 1 | 16,857 | 273,078 | 110 | 23:07:21 | 23:09:11 |

- **claude-sonnet-5-5**: 9 agent · 32 calls · out 34,003 · in 64 · cache_read 1,326,978 · cache_create 534,371
- **claude-opus-5-5**: 3 agent · 91 calls · out 8,721 · in 182 · cache_read 6,898,813 · cache_create 319,403
- **claude-haiku-5-5**: 19 agent · 38 calls · out 16,779 · in 76 · cache_read 630,546 · cache_create 613,287

