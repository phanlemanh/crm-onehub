### S4 round 1 — wf_27082c7c-58e (20 agent, 63,620 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 19 | 11,403 | 38 | 2,843,684 | 148 |
| review:conventions | claude-opus-5-5 | 21 | 8,711 | 42 | 2,937,827 | 128 |
| review:measurement | claude-opus-5-5 | 15 | 8,024 | 30 | 2,098,296 | 107 |
| synthesize:report | claude-sonnet-5-5 | 4 | 5,368 | 8 | 414,630 | 40 |
| baseline:diffBase | claude-sonnet-5-5 | 6 | 3,256 | 12 | 641,215 | 37 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 4 | 3,171 | 34 | 289,988 | 211 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 4 | 2,986 | 34 | 318,919 | 182 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 2,933 | 18 | 120,422 | 46 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,343 | 18 | 120,443 | 180 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 2,047 | 18 | 120,445 | 23 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 2,014 | 18 | 120,422 | 21 |
| machine:bun run test -- "cd apps/agent-okr && CR | claude-haiku-4-5-20251001 | 2 | 1,951 | 18 | 120,470 | 26 |
| judge:E5:spec-alignment | claude-sonnet-5-5 | 2 | 1,766 | 4 | 152,347 | 15 |
| judge:E5:domain-correctness | claude-sonnet-5-5 | 2 | 1,580 | 4 | 117,396 | 13 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 3 | 1,506 | 26 | 219,651 | 77 |
| judge:E5:operational-feasibility | claude-sonnet-5-5 | 2 | 1,165 | 4 | 152,349 | 14 |
| machine:node _acceptance/chan-trung-khoa-ban-nha | claude-haiku-4-5-20251001 | 2 | 1,108 | 18 | 120,451 | 17 |
| machine:node _acceptance/chan-trung-khoa-ban-nha | claude-haiku-4-5-20251001 | 2 | 1,018 | 18 | 120,449 | 16 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 934 | 18 | 120,420 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 336 | 4 | 116,409 | 6 |


wall: 777s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,256 | 641,215 | 37 | 04:35:06 | 04:35:44 |
| machine | 11 | 22,011 | 1,792,080 | 731 | 04:35:06 | 04:47:17 |
| judge | 3 | 4,511 | 422,092 | 16 | 04:35:06 | 04:35:22 |
| review | 3 | 28,138 | 7,879,807 | 150 | 04:35:06 | 04:37:36 |
| capture | 1 | 336 | 116,409 | 6 | 04:47:17 | 04:47:23 |
| synthesize | 1 | 5,368 | 414,630 | 40 | 04:47:23 | 04:48:03 |

- **claude-opus-5-5**: 3 agent · 55 calls · out 28,138 · in 110 · cache_read 7,879,807 · cache_create 432,791
- **claude-sonnet-5-5**: 6 agent · 18 calls · out 13,471 · in 36 · cache_read 1,594,346 · cache_create 763,992
- **claude-haiku-4-5-20251001**: 11 agent · 27 calls · out 22,011 · in 238 · cache_read 1,792,080 · cache_create 809,603

### S4 round 2 — wf_306dc972-1c4 (20 agent, 40,862 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 4,968 | 8 | 422,613 | 35 |
| baseline:diffBase | claude-sonnet-5-5 | 10 | 4,435 | 20 | 1,171,167 | 66 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 3,542 | 18 | 120,338 | 188 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,435 | 18 | 120,323 | 43 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,788 | 18 | 120,370 | 97 |
| review:bugs | claude-opus-5-5 | 7 | 2,417 | 14 | 854,469 | 38 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,022 | 18 | 120,344 | 177 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 1,934 | 18 | 91,272 | 226 |
| review:measurement | claude-opus-5-5 | 6 | 1,839 | 12 | 692,987 | 28 |
| judge:E5:domain-correctness | claude-sonnet-5-5 | 2 | 1,779 | 4 | 117,279 | 15 |
| judge:E5:spec-alignment | claude-sonnet-5-5 | 2 | 1,726 | 4 | 152,230 | 14 |
| machine:bun run test -- "cd apps/agent-okr && CR | claude-haiku-4-5-20251001 | 2 | 1,668 | 18 | 120,371 | 22 |
| judge:E5:operational-feasibility | claude-sonnet-5-5 | 2 | 1,655 | 4 | 152,232 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,622 | 18 | 120,323 | 21 |
| machine:node _acceptance/chan-trung-khoa-ban-nha | claude-haiku-4-5-20251001 | 2 | 1,186 | 18 | 120,352 | 18 |
| review:conventions | claude-opus-5-5 | 4 | 1,166 | 8 | 377,361 | 18 |
| machine:node _acceptance/chan-trung-khoa-ban-nha | claude-haiku-4-5-20251001 | 2 | 979 | 18 | 120,350 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 876 | 18 | 120,321 | 13 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 456 | 18 | 120,346 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 369 | 4 | 116,292 | 6 |


wall: 806s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,435 | 1,171,167 | 66 | 04:52:36 | 04:53:42 |
| machine | 11 | 20,508 | 1,294,710 | 765 | 04:52:36 | 05:05:21 |
| judge | 3 | 5,160 | 421,741 | 16 | 04:52:36 | 04:52:52 |
| review | 3 | 5,422 | 1,924,817 | 39 | 04:52:36 | 04:53:16 |
| capture | 1 | 369 | 116,292 | 6 | 05:05:21 | 05:05:27 |
| synthesize | 1 | 4,968 | 422,613 | 35 | 05:05:27 | 05:06:02 |

- **claude-sonnet-5-5**: 6 agent · 22 calls · out 14,932 · in 44 · cache_read 2,131,813 · cache_create 770,662
- **claude-haiku-4-5-20251001**: 11 agent · 22 calls · out 20,508 · in 198 · cache_read 1,294,710 · cache_create 802,010
- **claude-opus-5-5**: 3 agent · 17 calls · out 5,422 · in 34 · cache_read 1,924,817 · cache_create 357,434

