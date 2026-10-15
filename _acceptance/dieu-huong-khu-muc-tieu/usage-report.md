### S4 round 1 — wf_57d9558c-5f1 (30 agent, 63,744 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 15,791 | 4 | 61,295 | 90 |
| review:measurement | claude-opus-5-5 | 26 | 8,921 | 52 | 2,456,812 | 322 |
| triage | claude-sonnet-5-5 | 2 | 5,457 | 4 | 38,466 | 33 |
| ui:E2 | claude-sonnet-5-5 | 6 | 4,075 | 12 | 490,053 | 95 |
| review:conventions | claude-opus-5-5 | 21 | 3,746 | 42 | 1,582,015 | 148 |
| judge:E13:operational-feasibility | claude-sonnet-5-5 | 3 | 3,059 | 8 | 82,556 | 21 |
| judge:E13:domain-correctness | claude-sonnet-5-5 | 2 | 2,961 | 4 | 31,107 | 20 |
| review:bugs | claude-opus-5-5 | 19 | 2,491 | 38 | 1,266,780 | 154 |
| judge:E13:spec-alignment | claude-sonnet-5-5 | 2 | 2,377 | 4 | 34,469 | 14 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 2,020 | 4 | 33,438 | 148 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,742 | 4 | 30,487 | 312 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,559 | 4 | 33,356 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 1,343 | 4 | 33,350 | 11 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 1,320 | 4 | 33,409 | 14 |
| refute:hanh-dong-khu.tsx | claude-sonnet-5-5 | 7 | 1,232 | 14 | 230,533 | 31 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 832 | 4 | 33,406 | 12 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 592 | 4 | 38,306 | 47 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 581 | 4 | 33,372 | 286 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 424 | 4 | 33,407 | 14 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 379 | 4 | 33,406 | 10 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 372 | 4 | 33,411 | 63 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 367 | 4 | 33,405 | 11 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 313 | 4 | 33,396 | 8 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 304 | 4 | 33,381 | 289 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 289 | 4 | 33,407 | 12 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 286 | 4 | 33,406 | 10 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 282 | 4 | 33,400 | 93 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 282 | 4 | 33,405 | 12 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 201 | 4 | 33,354 | 31 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 29,283 | 7 |


wall: 1189s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 592 | 38,306 | 47 | 03:59:18 | 04:00:05 |
| machine | 18 | 12,896 | 598,196 | 1018 | 03:59:18 | 04:16:16 |
| ui | 1 | 4,075 | 490,053 | 95 | 03:59:18 | 04:00:54 |
| judge | 3 | 8,397 | 148,132 | 27 | 03:59:18 | 03:59:45 |
| review | 3 | 15,158 | 5,305,607 | 324 | 03:59:32 | 04:04:56 |
| triage | 1 | 5,457 | 38,466 | 33 | 04:16:18 | 04:16:52 |
| refute | 1 | 1,232 | 230,533 | 31 | 04:16:54 | 04:17:25 |
| capture | 1 | 146 | 29,283 | 7 | 04:17:28 | 04:17:34 |
| synthesize | 1 | 15,791 | 61,295 | 90 | 04:17:37 | 04:19:07 |

- **claude-sonnet-5-5**: 9 agent · 28 calls · out 35,690 · in 58 · cache_read 1,036,068 · cache_create 502,008
- **claude-opus-5-5**: 3 agent · 66 calls · out 15,158 · in 132 · cache_read 5,305,607 · cache_create 337,240
- **claude-haiku-5-5**: 18 agent · 36 calls · out 12,896 · in 72 · cache_read 598,196 · cache_create 578,304

### S4 round 2 — wf_0412087d-785 (27 agent, 38,326 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 11,549 | 6 | 115,300 | 67 |
| ui:E2 | claude-sonnet-5-5 | 5 | 4,976 | 10 | 382,004 | 181 |
| judge:E13:operational-feasibility | claude-sonnet-5-5 | 3 | 3,743 | 8 | 82,556 | 25 |
| judge:E13:domain-correctness | claude-sonnet-5-5 | 3 | 3,518 | 8 | 79,190 | 24 |
| triage | claude-sonnet-5-5 | 2 | 2,322 | 4 | 34,118 | 18 |
| review:measurement | claude-opus-5-5 | 9 | 2,103 | 18 | 419,325 | 82 |
| review:bugs | claude-opus-5-5 | 13 | 1,297 | 26 | 693,877 | 116 |
| review:conventions | claude-opus-5-5 | 11 | 1,149 | 22 | 523,757 | 85 |
| judge:E13:spec-alignment | claude-sonnet-5-5 | 2 | 1,144 | 4 | 34,469 | 16 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 600 | 4 | 30,487 | 298 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 561 | 4 | 2,869 | 369 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 534 | 4 | 33,438 | 95 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 477 | 4 | 33,400 | 94 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 458 | 4 | 33,405 | 24 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 453 | 4 | 33,407 | 27 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 425 | 4 | 33,372 | 283 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 326 | 4 | 33,406 | 23 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 318 | 4 | 33,356 | 7 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 315 | 4 | 33,409 | 23 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 301 | 4 | 33,411 | 63 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 295 | 4 | 33,407 | 22 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 294 | 4 | 33,406 | 22 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 291 | 4 | 33,406 | 21 |
| machine:bun _acceptance/dieu-huong-khu-muc-tieu/ | claude-haiku-5-5 | 2 | 288 | 4 | 33,405 | 22 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 224 | 4 | 33,354 | 20 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 33,350 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 29,283 | 7 |


wall: 1171s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 17 | 6,375 | 534,288 | 1062 | 04:37:44 | 04:55:26 |
| ui | 1 | 4,976 | 382,004 | 181 | 04:37:44 | 04:40:45 |
| judge | 3 | 8,405 | 196,215 | 27 | 04:37:44 | 04:38:11 |
| review | 3 | 4,549 | 1,636,959 | 137 | 04:37:44 | 04:40:01 |
| triage | 1 | 2,322 | 34,118 | 18 | 04:55:28 | 04:55:46 |
| capture | 1 | 150 | 29,283 | 7 | 04:55:48 | 04:55:55 |
| synthesize | 1 | 11,549 | 115,300 | 67 | 04:56:08 | 04:57:15 |

- **claude-sonnet-5-5**: 7 agent · 20 calls · out 27,402 · in 44 · cache_read 756,920 · cache_create 403,759
- **claude-opus-5-5**: 3 agent · 33 calls · out 4,549 · in 66 · cache_read 1,636,959 · cache_create 209,525
- **claude-haiku-5-5**: 17 agent · 34 calls · out 6,375 · in 68 · cache_read 534,288 · cache_create 577,275

