### S4 round 1 — wf_b935a9e1-f1b (18 agent, 81,429 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 32 | 30,109 | 64 | 3,848,453 | 404 |
| review:measurement | claude-opus-5-5 | 17 | 14,266 | 34 | 1,542,392 | 177 |
| review:conventions | claude-opus-5-5 | 12 | 10,739 | 24 | 919,976 | 131 |
| synthesize:report | claude-sonnet-5-5 | 2 | 8,386 | 4 | 71,343 | 49 |
| baseline:diffBase | claude-sonnet-5-5 | 3 | 4,863 | 6 | 126,015 | 82 |
| triage | claude-sonnet-5-5 | 2 | 4,500 | 4 | 59,362 | 36 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,518 | 4 | 56,505 | 10 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 885 | 4 | 56,499 | 9 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 827 | 4 | 3,381 | 597 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 758 | 4 | 3,381 | 316 |
| machine:node _acceptance/nang-kit-3-1-1/rang/luo | claude-haiku-5-5 | 2 | 711 | 4 | 56,539 | 132 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 661 | 4 | 56,560 | 74 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 608 | 4 | 3,381 | 410 |
| machine:node _acceptance/nang-kit-3-1-1/rang/doi | claude-haiku-5-5 | 2 | 603 | 4 | 56,538 | 168 |
| machine:node --test _acceptance/nang-kit-3-1-1/t | claude-haiku-5-5 | 2 | 572 | 4 | 56,540 | 12 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 545 | 4 | 56,503 | 25 |
| machine:node scripts/product-map.mjs --root . -- | claude-haiku-5-5 | 2 | 521 | 4 | 56,516 | 53 |
| capture:provenance | claude-sonnet-5-5 | 2 | 357 | 4 | 51,907 | 8 |


wall: 1540s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,863 | 126,015 | 82 | 16:37:09 | 16:38:32 |
| review | 3 | 55,114 | 6,310,821 | 406 | 16:37:09 | 16:43:55 |
| machine | 11 | 8,209 | 462,343 | 1444 | 16:37:09 | 17:01:13 |
| triage | 1 | 4,500 | 59,362 | 36 | 17:01:14 | 17:01:50 |
| capture | 1 | 357 | 51,907 | 8 | 17:01:50 | 17:01:58 |
| synthesize | 1 | 8,386 | 71,343 | 50 | 17:02:00 | 17:02:49 |

- **claude-opus-5-5**: 3 agent · 61 calls · out 55,114 · in 122 · cache_read 6,310,821 · cache_create 386,981
- **claude-sonnet-5-5**: 4 agent · 9 calls · out 18,106 · in 18 · cache_read 308,627 · cache_create 279,569
- **claude-haiku-5-5**: 11 agent · 22 calls · out 8,209 · in 44 · cache_read 462,343 · cache_create 780,126

### S4 round 2 — wf_2d80b965-89f (16 agent, 17,025 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 4,181 | 4 | 62,693 | 25 |
| review:bugs | claude-opus-5-5 | 6 | 1,920 | 12 | 324,757 | 31 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,601 | 4 | 56,515 | 11 |
| review:conventions | claude-opus-5-5 | 4 | 1,320 | 8 | 174,492 | 22 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 853 | 4 | 3,381 | 588 |
| machine:node _acceptance/nang-kit-3-1-1/rang/luo | claude-haiku-5-5 | 2 | 767 | 4 | 56,549 | 129 |
| review:measurement | claude-opus-5-5 | 3 | 758 | 6 | 116,744 | 13 |
| machine:node _acceptance/nang-kit-3-1-1/rang/doi | claude-haiku-5-5 | 2 | 742 | 4 | 56,548 | 164 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 733 | 4 | 56,570 | 73 |
| machine:node scripts/product-map.mjs --root . -- | claude-haiku-5-5 | 2 | 673 | 4 | 56,526 | 52 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 670 | 4 | 3,381 | 323 |
| machine:node --test _acceptance/nang-kit-3-1-1/t | claude-haiku-5-5 | 2 | 616 | 4 | 56,550 | 11 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 615 | 4 | 56,513 | 25 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 610 | 4 | 6,762 | 396 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 523 | 4 | 56,509 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 443 | 4 | 51,917 | 10 |


wall: 1466s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| review | 3 | 3,998 | 615,993 | 33 | 17:04:12 | 17:04:44 |
| machine | 11 | 8,403 | 465,804 | 1429 | 17:04:12 | 17:28:01 |
| capture | 1 | 443 | 51,917 | 10 | 17:28:02 | 17:28:12 |
| synthesize | 1 | 4,181 | 62,693 | 25 | 17:28:13 | 17:28:38 |

- **claude-sonnet-5-5**: 2 agent · 4 calls · out 4,624 · in 8 · cache_read 114,610 · cache_create 133,619
- **claude-opus-5-5**: 3 agent · 13 calls · out 3,998 · in 26 · cache_read 615,993 · cache_create 195,032
- **claude-haiku-5-5**: 11 agent · 22 calls · out 8,403 · in 44 · cache_read 465,804 · cache_create 776,312

