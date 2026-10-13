### S4 round 1 — wf_96b4d3e3-2b2 (27 agent, 106,026 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 19,280 | 10 | 294,161 | 133 |
| review:bugs | claude-opus-5-5 | 21 | 13,031 | 42 | 1,883,284 | 199 |
| review:conventions | claude-opus-5-5 | 15 | 11,586 | 30 | 1,085,599 | 158 |
| review:measurement | claude-opus-5-5 | 10 | 11,499 | 20 | 678,631 | 149 |
| machine:bun _acceptance/bo-ca-mau-quy-4/rang/do- | claude-haiku-5-5 | 8 | 8,465 | 16 | 327,654 | 562 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 6,419 | 4 | 43,396 | 38 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 5 | 6,148 | 10 | 234,466 | 55 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 5 | 5,026 | 10 | 232,917 | 42 |
| triage | claude-sonnet-5-5 | 2 | 4,973 | 4 | 44,300 | 33 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 4 | 4,538 | 8 | 168,635 | 40 |
| refute:do-gop-y-quy-4.mjs | claude-sonnet-5-5 | 4 | 1,998 | 8 | 141,342 | 23 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,769 | 4 | 40,279 | 10 |
| refute:do-gop-y-quy-4.mjs | claude-sonnet-5-5 | 5 | 1,505 | 10 | 174,774 | 22 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 888 | 4 | 40,325 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 863 | 4 | 40,320 | 11 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 856 | 4 | 40,334 | 68 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 844 | 4 | 40,295 | 268 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 803 | 4 | 40,323 | 11 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 787 | 4 | 40,324 | 11 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 705 | 4 | 40,304 | 237 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 687 | 4 | 40,277 | 38 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 631 | 4 | 40,322 | 10 |
| machine:bun _acceptance/bo-ca-mau-quy-4/rang/do- | claude-haiku-5-5 | 2 | 630 | 4 | 40,331 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 616 | 4 | 40,273 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 603 | 4 | 37,410 | 266 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 470 | 4 | 40,319 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 406 | 4 | 36,199 | 8 |


wall: 1657s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,419 | 43,396 | 38 | 01:04:50 | 01:05:28 |
| machine | 15 | 19,617 | 889,090 | 1458 | 01:04:50 | 01:29:08 |
| judge | 3 | 15,712 | 636,018 | 55 | 01:04:50 | 01:05:45 |
| review | 3 | 36,116 | 3,647,514 | 202 | 01:04:59 | 01:08:21 |
| triage | 1 | 4,973 | 44,300 | 33 | 01:29:08 | 01:29:41 |
| refute | 2 | 3,503 | 316,116 | 25 | 01:29:41 | 01:30:06 |
| capture | 1 | 406 | 36,199 | 8 | 01:30:06 | 01:30:14 |
| synthesize | 1 | 19,280 | 294,161 | 133 | 01:30:14 | 01:32:27 |

- **claude-sonnet-5-5**: 9 agent · 34 calls · out 50,293 · in 68 · cache_read 1,370,190 · cache_create 536,882
- **claude-opus-5-5**: 3 agent · 46 calls · out 36,116 · in 92 · cache_read 3,647,514 · cache_create 307,937
- **claude-haiku-5-5**: 15 agent · 36 calls · out 19,617 · in 72 · cache_read 889,090 · cache_create 617,021

### S4 round 2 — wf_03f141b9-873 (20 agent, 88,656 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 12,338 | 6 | 131,634 | 79 |
| machine:bun _acceptance/bo-ca-mau-quy-4/rang/do- | claude-haiku-5-5 | 11 | 11,902 | 22 | 489,629 | 922 |
| review:bugs | claude-opus-5-5 | 17 | 11,608 | 34 | 1,263,948 | 143 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 5 | 8,438 | 10 | 283,195 | 66 |
| review:measurement | claude-opus-5-5 | 9 | 8,161 | 18 | 530,576 | 92 |
| review:conventions | claude-opus-5-5 | 10 | 6,714 | 20 | 556,358 | 83 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 6 | 6,563 | 12 | 328,591 | 60 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 6 | 6,251 | 12 | 326,323 | 50 |
| triage | claude-sonnet-5-5 | 2 | 3,585 | 4 | 41,943 | 26 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 2,732 | 4 | 40,067 | 20 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,306 | 4 | 40,321 | 11 |
| refute:do-gop-y-quy-4.mjs | claude-sonnet-5-5 | 3 | 1,688 | 6 | 82,186 | 18 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,605 | 4 | 37,452 | 241 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 816 | 4 | 40,337 | 265 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 806 | 4 | 40,346 | 229 |
| machine:bun _acceptance/bo-ca-mau-quy-4/rang/do- | claude-haiku-5-5 | 2 | 777 | 4 | 40,373 | 6 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 718 | 4 | 40,376 | 65 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 609 | 4 | 40,319 | 23 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 546 | 4 | 40,315 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 493 | 4 | 36,263 | 8 |


wall: 1896s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,732 | 40,067 | 20 | 02:55:51 | 02:56:11 |
| machine | 9 | 20,085 | 809,468 | 1765 | 02:55:51 | 03:25:16 |
| judge | 3 | 21,252 | 938,109 | 68 | 02:55:51 | 02:56:59 |
| review | 3 | 26,483 | 2,350,882 | 144 | 02:55:51 | 02:58:16 |
| triage | 1 | 3,585 | 41,943 | 27 | 03:25:16 | 03:25:43 |
| refute | 1 | 1,688 | 82,186 | 18 | 03:25:43 | 03:26:00 |
| capture | 1 | 493 | 36,263 | 9 | 03:26:00 | 03:26:09 |
| synthesize | 1 | 12,338 | 131,634 | 79 | 03:26:09 | 03:27:27 |

- **claude-sonnet-5-5**: 8 agent · 29 calls · out 42,088 · in 58 · cache_read 1,270,202 · cache_create 516,987
- **claude-haiku-5-5**: 9 agent · 27 calls · out 20,085 · in 54 · cache_read 809,468 · cache_create 382,859
- **claude-opus-5-5**: 3 agent · 36 calls · out 26,483 · in 72 · cache_read 2,350,882 · cache_create 255,735

