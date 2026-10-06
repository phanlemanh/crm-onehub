### S4 round 1 — wf_066c2f2f-565 (31 agent, 96,014 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:measurement | claude-opus-5-5 | 11 | 17,210 | 22 | 1,378,842 | 182 |
| synthesize:report | claude-sonnet-5-5 | 4 | 16,298 | 8 | 405,883 | 95 |
| review:conventions | claude-opus-5-5 | 10 | 8,928 | 20 | 1,086,793 | 101 |
| triage | claude-sonnet-5-5 | 2 | 6,892 | 4 | 98,931 | 52 |
| review:bugs | claude-opus-5-5 | 9 | 6,424 | 18 | 1,013,802 | 130 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,667 | 18 | 93,446 | 104 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 3,433 | 18 | 93,467 | 40 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 3,129 | 8 | 289,247 | 30 |
| machine:bun run test:dieu-phoi | claude-haiku-4-5-20251001 | 3 | 2,417 | 26 | 166,731 | 29 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,957 | 18 | 66,779 | 225 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,859 | 18 | 93,461 | 206 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 4 | 1,849 | 34 | 238,782 | 210 |
| machine:node --test scripts/dieu-phoi/test/lich. | claude-haiku-4-5-20251001 | 2 | 1,638 | 18 | 93,465 | 21 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,595 | 18 | 93,467 | 21 |
| judge:E22:spec-alignment | claude-sonnet-5-5 | 2 | 1,536 | 4 | 122,591 | 16 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,510 | 18 | 93,469 | 18 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,449 | 18 | 93,468 | 46 |
| machine:node --test scripts/dieu-phoi/test/hook- | claude-haiku-4-5-20251001 | 2 | 1,387 | 18 | 93,469 | 17 |
| judge:E22:domain-correctness | claude-sonnet-5-5 | 2 | 1,371 | 4 | 90,604 | 13 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 1,358 | 18 | 93,493 | 69 |
| machine:node --test scripts/dieu-phoi/test/hook- | claude-haiku-4-5-20251001 | 2 | 1,306 | 18 | 93,472 | 16 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,276 | 18 | 93,468 | 16 |
| machine:node --test scripts/dieu-phoi/test/phat- | claude-haiku-4-5-20251001 | 2 | 1,270 | 18 | 93,469 | 19 |
| machine:node --test scripts/dieu-phoi/test/bang. | claude-haiku-4-5-20251001 | 2 | 1,139 | 18 | 93,463 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,128 | 18 | 93,446 | 15 |
| machine:node --test scripts/dieu-phoi/test/suc-k | claude-haiku-4-5-20251001 | 2 | 1,037 | 18 | 93,470 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 892 | 18 | 93,444 | 13 |
| machine:node --test scripts/dieu-phoi/test/yeu-c | claude-haiku-4-5-20251001 | 2 | 884 | 18 | 93,470 | 18 |
| machine:node --test scripts/dieu-phoi/test/cli.t | claude-haiku-4-5-20251001 | 2 | 591 | 18 | 93,465 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 298 | 4 | 89,768 | 8 |
| judge:E22:operational-feasibility | claude-sonnet-5-5 | 2 | 286 | 4 | 122,593 | 14 |


wall: 998s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,129 | 289,247 | 31 | 22:38:56 | 22:39:27 |
| machine | 21 | 33,642 | 2,154,664 | 843 | 22:38:57 | 22:53:00 |
| judge | 3 | 3,193 | 335,788 | 18 | 22:39:15 | 22:39:34 |
| review | 3 | 32,562 | 3,479,437 | 190 | 22:39:19 | 22:42:29 |
| triage | 1 | 6,892 | 98,931 | 52 | 22:53:00 | 22:53:52 |
| capture | 1 | 298 | 89,768 | 8 | 22:53:52 | 22:54:00 |
| synthesize | 1 | 16,298 | 405,883 | 95 | 22:54:00 | 22:55:35 |

- **claude-opus-5-5**: 3 agent · 30 calls · out 32,562 · in 60 · cache_read 3,479,437 · cache_create 427,147
- **claude-sonnet-5-5**: 7 agent · 18 calls · out 29,810 · in 36 · cache_read 1,219,617 · cache_create 696,244
- **claude-haiku-4-5-20251001**: 21 agent · 45 calls · out 33,642 · in 402 · cache_read 2,154,664 · cache_create 985,892

### S4 round 2 — wf_39a889eb-ab9 (37 agent, 106,415 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 15,698 | 8 | 436,217 | 94 |
| review:measurement | claude-opus-5-5 | 18 | 13,105 | 36 | 2,760,176 | 165 |
| review:bugs | claude-opus-5-5 | 9 | 11,814 | 18 | 996,356 | 129 |
| review:conventions | claude-opus-5-5 | 8 | 8,811 | 16 | 829,725 | 98 |
| triage | claude-sonnet-5-5 | 2 | 4,939 | 4 | 96,834 | 37 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 3,379 | 18 | 93,455 | 42 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,248 | 18 | 93,434 | 97 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 8 | 3,113 | 66 | 538,246 | 594 |
| baseline:diffBase | claude-sonnet-5-5 | 4 | 2,870 | 8 | 290,299 | 32 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 4 | 2,855 | 34 | 240,087 | 410 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,400 | 18 | 93,481 | 83 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 6 | 2,365 | 50 | 361,933 | 235 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 2,033 | 18 | 93,457 | 21 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 3 | 1,874 | 26 | 164,888 | 24 |
| refute:lich.test.mjs | claude-sonnet-5-5 | 5 | 1,787 | 10 | 426,182 | 25 |
| machine:node --test scripts/dieu-phoi/test/phat- | claude-haiku-4-5-20251001 | 2 | 1,756 | 18 | 93,457 | 23 |
| judge:E22:domain-correctness | claude-sonnet-5-5 | 2 | 1,525 | 4 | 90,591 | 15 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,504 | 18 | 93,456 | 47 |
| judge:E22:spec-alignment | claude-sonnet-5-5 | 2 | 1,464 | 4 | 122,578 | 14 |
| machine:node _acceptance/dieu-phoi-hai-tang/rang | claude-haiku-4-5-20251001 | 2 | 1,461 | 18 | 93,455 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,456 | 18 | 93,434 | 19 |
| machine:node --test scripts/dieu-phoi/test/hook- | claude-haiku-4-5-20251001 | 2 | 1,449 | 18 | 93,457 | 19 |
| machine:node --test scripts/dieu-phoi/test/bien. | claude-haiku-4-5-20251001 | 2 | 1,447 | 18 | 93,451 | 18 |
| refute:phat-lich.mjs | claude-sonnet-5-5 | 5 | 1,397 | 10 | 392,162 | 23 |
| machine:node --test scripts/dieu-phoi/test/yeu-c | claude-haiku-4-5-20251001 | 2 | 1,389 | 18 | 93,458 | 17 |
| machine:node --test scripts/dieu-phoi/test/suc-k | claude-haiku-4-5-20251001 | 2 | 1,339 | 18 | 93,458 | 17 |
| machine:node --test scripts/dieu-phoi/test/bang. | claude-haiku-4-5-20251001 | 2 | 1,249 | 18 | 93,451 | 16 |
| judge:E22:operational-feasibility | claude-sonnet-5-5 | 2 | 1,215 | 4 | 122,580 | 15 |
| refute:phat-lich.test.mjs | claude-sonnet-5-5 | 4 | 1,201 | 8 | 323,462 | 19 |
| refute:yeu-cau.test.mjs | claude-sonnet-5-5 | 2 | 1,087 | 4 | 121,914 | 13 |
| machine:node --test scripts/dieu-phoi/test/hook- | claude-haiku-4-5-20251001 | 2 | 1,040 | 18 | 93,460 | 15 |
| machine:node --test scripts/dieu-phoi/test/lich. | claude-haiku-4-5-20251001 | 2 | 982 | 18 | 93,453 | 19 |
| machine:node --test scripts/dieu-phoi/test/cli.t | claude-haiku-4-5-20251001 | 2 | 872 | 18 | 93,453 | 13 |
| triage | claude-sonnet-5-5 | 2 | 828 | 4 | 124,079 | 11 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 798 | 18 | 93,432 | 13 |
| machine:bun run test:dieu-phoi | claude-haiku-4-5-20251001 | 2 | 383 | 18 | 93,438 | 11 |
| capture:provenance | claude-sonnet-5-5 | 2 | 282 | 4 | 121,689 | 7 |


wall: 1628s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,870 | 290,299 | 32 | 23:04:27 | 23:04:59 |
| machine | 22 | 38,392 | 2,987,294 | 1452 | 23:04:27 | 23:28:39 |
| judge | 3 | 4,204 | 335,749 | 18 | 23:04:47 | 23:05:05 |
| review | 3 | 33,730 | 4,586,257 | 173 | 23:04:51 | 23:07:44 |
| triage | 2 | 5,767 | 220,913 | 48 | 23:28:39 | 23:29:27 |
| refute | 4 | 5,472 | 1,263,720 | 28 | 23:29:27 | 23:29:55 |
| capture | 1 | 282 | 121,689 | 7 | 23:29:55 | 23:30:01 |
| synthesize | 1 | 15,698 | 436,217 | 94 | 23:30:01 | 23:31:36 |

- **claude-sonnet-5-5**: 12 agent · 36 calls · out 34,293 · in 72 · cache_read 2,668,587 · cache_create 1,024,734
- **claude-opus-5-5**: 3 agent · 35 calls · out 33,730 · in 70 · cache_read 4,586,257 · cache_create 422,977
- **claude-haiku-4-5-20251001**: 22 agent · 57 calls · out 38,392 · in 500 · cache_read 2,987,294 · cache_create 1,039,897

