### S4 round 1 — wf_d47e90dc-7a2 (24 agent, 43,657 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 12,161 | 8 | 182,847 | 77 |
| triage | claude-sonnet-5-5 | 2 | 5,689 | 4 | 37,600 | 42 |
| ui:E10 | claude-sonnet-5-5 | 14 | 4,711 | 28 | 1,317,208 | 161 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,104 | 4 | 34,193 | 31 |
| review:measurement | claude-opus-5-5 | 10 | 2,519 | 20 | 522,997 | 138 |
| judge:E11:domain-correctness | claude-sonnet-5-5 | 2 | 2,132 | 4 | 31,283 | 26 |
| review:bugs | claude-opus-5-5 | 23 | 1,901 | 46 | 1,682,566 | 228 |
| review:conventions | claude-opus-5-5 | 21 | 1,671 | 42 | 1,329,434 | 157 |
| judge:E11:operational-feasibility | claude-sonnet-5-5 | 2 | 1,639 | 4 | 31,285 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,488 | 4 | 34,195 | 11 |
| judge:E11:spec-alignment | claude-sonnet-5-5 | 2 | 1,388 | 4 | 31,283 | 18 |
| refute:tra-cuu-thuong-hieu-viet-nam.dom.tsx | claude-sonnet-5-5 | 3 | 960 | 6 | 68,678 | 22 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 727 | 4 | 35,088 | 31 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 690 | 4 | 34,252 | 8 |
| refute:ten-mien-nen-tang.spec.ts | claude-sonnet-5-5 | 5 | 673 | 10 | 142,685 | 28 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 436 | 4 | 2,869 | 353 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 306 | 4 | 2,869 | 335 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 305 | 4 | 34,250 | 74 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 302 | 4 | 31,326 | 293 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 270 | 4 | 34,238 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 34,189 | 7 |
| machine:cd packages/validation && bun test ./tes | claude-haiku-5-5 | 2 | 196 | 4 | 34,220 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 30,122 | 8 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 26 | 4 | 34,227 | 9 |


wall: 1276s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 727 | 35,088 | 31 | 14:03:47 | 14:04:18 |
| machine | 11 | 7,336 | 310,828 | 1112 | 14:03:47 | 14:22:19 |
| ui | 1 | 4,711 | 1,317,208 | 161 | 14:03:47 | 14:06:28 |
| judge | 3 | 5,159 | 93,851 | 26 | 14:03:47 | 14:04:13 |
| review | 3 | 6,091 | 3,534,997 | 231 | 14:03:47 | 14:07:38 |
| triage | 1 | 5,689 | 37,600 | 42 | 14:22:21 | 14:23:03 |
| refute | 2 | 1,633 | 211,363 | 28 | 14:23:04 | 14:23:33 |
| capture | 1 | 150 | 30,122 | 8 | 14:23:34 | 14:23:42 |
| synthesize | 1 | 12,161 | 182,847 | 77 | 14:23:46 | 14:25:03 |

- **claude-sonnet-5-5**: 10 agent · 38 calls · out 30,230 · in 76 · cache_read 1,908,079 · cache_create 530,826
- **claude-haiku-5-5**: 11 agent · 22 calls · out 7,336 · in 44 · cache_read 310,828 · cache_create 432,588
- **claude-opus-5-5**: 3 agent · 54 calls · out 6,091 · in 108 · cache_read 3,534,997 · cache_create 278,640

### S4 round 2 — wf_f431dede-83d (19 agent, 26,593 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 11,073 | 6 | 106,935 | 79 |
| ui:E10 | claude-sonnet-5-5 | 7 | 3,709 | 14 | 589,976 | 138 |
| judge:E11:operational-feasibility | claude-sonnet-5-5 | 2 | 2,613 | 4 | 34,641 | 21 |
| judge:E11:domain-correctness | claude-sonnet-5-5 | 2 | 1,692 | 4 | 31,277 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,505 | 4 | 34,189 | 11 |
| judge:E11:spec-alignment | claude-sonnet-5-5 | 2 | 1,350 | 4 | 34,639 | 16 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,143 | 4 | 34,187 | 42 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 890 | 4 | 33,966 | 24 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 481 | 4 | 2,869 | 375 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 307 | 4 | 2,869 | 341 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 304 | 4 | 31,320 | 277 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 301 | 4 | 34,244 | 73 |
| machine:cd packages/validation && bun test ./tes | claude-haiku-5-5 | 2 | 220 | 4 | 34,214 | 6 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 219 | 4 | 34,246 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 34,183 | 7 |
| review:conventions | claude-opus-5-5 | 5 | 186 | 10 | 182,849 | 28 |
| capture:provenance | claude-sonnet-5-5 | 2 | 147 | 4 | 30,116 | 9 |
| review:measurement | claude-opus-5-5 | 6 | 131 | 12 | 257,049 | 39 |
| review:bugs | claude-opus-5-5 | 7 | 107 | 14 | 333,993 | 40 |


wall: 1225s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 890 | 33,966 | 24 | 14:29:12 | 14:29:36 |
| machine | 9 | 4,695 | 242,321 | 1134 | 14:29:12 | 14:48:07 |
| ui | 1 | 3,709 | 589,976 | 138 | 14:29:12 | 14:31:31 |
| judge | 3 | 5,655 | 100,557 | 24 | 14:29:12 | 14:29:37 |
| review | 3 | 424 | 773,891 | 42 | 14:29:12 | 14:29:55 |
| capture | 1 | 147 | 30,116 | 9 | 14:48:08 | 14:48:17 |
| synthesize | 1 | 11,073 | 106,935 | 79 | 14:48:18 | 14:49:37 |

- **claude-sonnet-5-5**: 7 agent · 20 calls · out 21,474 · in 40 · cache_read 861,550 · cache_create 396,260
- **claude-haiku-5-5**: 9 agent · 18 calls · out 4,695 · in 36 · cache_read 242,321 · cache_create 364,061
- **claude-opus-5-5**: 3 agent · 18 calls · out 424 · in 36 · cache_read 773,891 · cache_create 179,306

### S4 round 3 — wf_77900650-a31 (23 agent, 36,709 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 7 | 13,863 | 14 | 442,565 | 91 |
| review:bugs | claude-opus-5-5 | 17 | 3,894 | 34 | 1,150,162 | 182 |
| review:measurement | claude-opus-5-5 | 10 | 3,754 | 20 | 563,554 | 129 |
| triage | claude-sonnet-5-5 | 2 | 3,358 | 4 | 34,982 | 24 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,408 | 4 | 34,323 | 11 |
| judge:E11:operational-feasibility | claude-sonnet-5-5 | 2 | 1,224 | 4 | 34,800 | 12 |
| judge:E11:domain-correctness | claude-sonnet-5-5 | 2 | 1,202 | 4 | 31,436 | 12 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,180 | 4 | 34,366 | 13 |
| judge:E11:spec-alignment | claude-sonnet-5-5 | 2 | 1,172 | 4 | 34,798 | 12 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 748 | 4 | 34,677 | 27 |
| judge:E13:spec-alignment | claude-sonnet-5-5 | 2 | 719 | 4 | 34,558 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 693 | 4 | 34,317 | 9 |
| judge:E13:domain-correctness | claude-sonnet-5-5 | 2 | 521 | 4 | 34,558 | 8 |
| judge:E13:operational-feasibility | claude-sonnet-5-5 | 2 | 480 | 4 | 34,560 | 8 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 435 | 4 | 2,869 | 396 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 403 | 4 | 34,321 | 39 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 306 | 4 | 34,378 | 75 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 306 | 4 | 2,869 | 411 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 301 | 4 | 31,454 | 293 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-5-5 | 2 | 221 | 4 | 34,380 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 218 | 4 | 34,355 | 10 |
| review:conventions | claude-opus-5-5 | 9 | 157 | 18 | 414,521 | 73 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 30,250 | 7 |


wall: 1370s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 748 | 34,677 | 27 | 03:36:51 | 03:37:18 |
| machine | 10 | 5,471 | 277,632 | 1244 | 03:36:51 | 03:57:35 |
| judge | 6 | 5,318 | 204,710 | 14 | 03:36:51 | 03:37:05 |
| review | 3 | 7,805 | 2,128,237 | 194 | 03:36:51 | 03:40:05 |
| triage | 1 | 3,358 | 34,982 | 24 | 03:57:36 | 03:58:00 |
| capture | 1 | 146 | 30,250 | 7 | 03:58:01 | 03:58:09 |
| synthesize | 1 | 13,863 | 442,565 | 91 | 03:58:10 | 03:59:41 |

- **claude-sonnet-5-5**: 10 agent · 25 calls · out 23,433 · in 50 · cache_read 747,184 · cache_create 450,222
- **claude-opus-5-5**: 3 agent · 36 calls · out 7,805 · in 72 · cache_read 2,128,237 · cache_create 247,931
- **claude-haiku-5-5**: 10 agent · 20 calls · out 5,471 · in 40 · cache_read 277,632 · cache_create 399,857

