### S4 round 1 — wf_4c21d758-44b (26 agent, 78,852 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 38,904 | 4 | 103,952 | 405 |
| triage | claude-sonnet-5 | 2 | 9,750 | 4 | 93,475 | 114 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 3 | 7,882 | 6 | 223,590 | 90 |
| baseline:diffBase | claude-sonnet-5 | 33 | 2,508 | 66 | 3,719,547 | 496 |
| review:conventions | claude-opus-5-5 | 18 | 2,164 | 36 | 2,177,436 | 135 |
| review:bugs | claude-opus-5-5 | 10 | 1,900 | 20 | 1,009,165 | 93 |
| refute:khoa-api-ghi-thua.spec.ts | claude-sonnet-5 | 6 | 1,677 | 12 | 491,229 | 46 |
| review:measurement | claude-opus-5-5 | 5 | 1,631 | 10 | 431,124 | 63 |
| judge:E13:domain-correctness | claude-sonnet-5 | 8 | 1,573 | 16 | 703,113 | 116 |
| judge:E13:spec-alignment | claude-sonnet-5 | 6 | 1,447 | 12 | 556,982 | 79 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 938 | 34 | 239,450 | 28 |
| judge:E14:operational-feasibility | claude-sonnet-5 | 3 | 929 | 6 | 223,236 | 26 |
| judge:E14:spec-alignment | claude-sonnet-5 | 3 | 840 | 6 | 223,130 | 27 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 790 | 18 | 90,023 | 17 |
| judge:E14:domain-correctness | claude-sonnet-5 | 3 | 737 | 6 | 223,251 | 29 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 711 | 18 | 90,027 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 8 | 596 | 66 | 511,085 | 52 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 590 | 18 | 90,023 | 32 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 572 | 18 | 90,062 | 15 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 555 | 18 | 90,062 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 475 | 26 | 158,144 | 23 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 461 | 34 | 201,888 | 204 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 438 | 18 | 90,062 | 18 |
| machine:node _acceptance/khoa-api-ghi-thua/rang/ | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 90,047 | 14 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 282 | 18 | 90,021 | 11 |
| capture:provenance | claude-sonnet-5 | 2 | 135 | 4 | 89,909 | 13 |


wall: 918s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,508 | 3,719,547 | 496 | 01:07:32 | 01:15:48 |
| machine | 12 | 6,775 | 1,830,894 | 269 | 01:07:32 | 01:12:01 |
| judge | 6 | 13,408 | 2,153,302 | 116 | 01:07:32 | 01:09:28 |
| review | 3 | 5,695 | 3,617,725 | 135 | 01:07:58 | 01:10:14 |
| triage | 1 | 9,750 | 93,475 | 114 | 01:12:03 | 01:13:57 |
| refute | 1 | 1,677 | 491,229 | 46 | 01:13:59 | 01:14:44 |
| capture | 1 | 135 | 89,909 | 13 | 01:15:50 | 01:16:03 |
| synthesize | 1 | 38,904 | 103,952 | 405 | 01:16:05 | 01:22:50 |

- **claude-sonnet-5**: 11 agent · 71 calls · out 66,382 · in 142 · cache_read 6,651,414 · cache_create 1,002,595
- **claude-opus-5-5**: 3 agent · 33 calls · out 5,695 · in 66 · cache_read 3,617,725 · cache_create 312,893
- **claude-haiku-4-5-20251001**: 12 agent · 35 calls · out 6,775 · in 304 · cache_read 1,830,894 · cache_create 566,924

### S4 round 2 — wf_bb01dc2a-39c (23 agent, 46,817 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 19,725 | 4 | 101,934 | 214 |
| judge:E13:spec-alignment | claude-sonnet-5 | 4 | 6,623 | 8 | 339,208 | 76 |
| judge:E13:domain-correctness | claude-sonnet-5 | 3 | 4,493 | 6 | 195,310 | 56 |
| review:measurement | claude-opus-5-5 | 4 | 2,333 | 8 | 321,575 | 56 |
| triage | claude-sonnet-5 | 2 | 1,668 | 4 | 91,831 | 25 |
| review:conventions | claude-opus-5-5 | 4 | 1,422 | 8 | 278,308 | 40 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 4 | 1,288 | 8 | 337,368 | 33 |
| judge:E14:domain-correctness | claude-sonnet-5 | 2 | 1,060 | 4 | 126,598 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 821 | 42 | 296,737 | 35 |
| judge:E14:operational-feasibility | claude-sonnet-5 | 3 | 713 | 6 | 223,164 | 17 |
| judge:E14:spec-alignment | claude-sonnet-5 | 3 | 704 | 6 | 223,230 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 636 | 34 | 228,757 | 27 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 626 | 34 | 200,228 | 115 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 6 | 624 | 52 | 366,410 | 35 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 561 | 18 | 90,096 | 19 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 558 | 18 | 90,096 | 18 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 530 | 18 | 90,057 | 15 |
| review:bugs | claude-opus-5-5 | 14 | 523 | 28 | 1,443,398 | 113 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 478 | 18 | 90,096 | 18 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 459 | 18 | 90,061 | 21 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 408 | 18 | 90,057 | 22 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 386 | 18 | 90,055 | 14 |
| capture:provenance | claude-sonnet-5 | 2 | 178 | 4 | 89,947 | 11 |


wall: 425s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 11 | 6,087 | 1,722,650 | 171 | 01:31:48 | 01:34:39 |
| judge | 6 | 14,881 | 1,444,878 | 78 | 01:31:48 | 01:33:05 |
| review | 3 | 4,278 | 2,043,281 | 114 | 01:32:10 | 01:34:04 |
| triage | 1 | 1,668 | 91,831 | 25 | 01:34:40 | 01:35:05 |
| capture | 1 | 178 | 89,947 | 11 | 01:35:07 | 01:35:17 |
| synthesize | 1 | 19,725 | 101,934 | 214 | 01:35:19 | 01:38:53 |

- **claude-sonnet-5**: 9 agent · 25 calls · out 36,452 · in 50 · cache_read 1,728,590 · cache_create 767,983
- **claude-opus-5-5**: 3 agent · 22 calls · out 4,278 · in 44 · cache_read 2,043,281 · cache_create 264,952
- **claude-haiku-4-5-20251001**: 11 agent · 33 calls · out 6,087 · in 288 · cache_read 1,722,650 · cache_create 510,543

### S4 round 2 thử lại — wf_bb01dc2a-39c (46 agent, 97,371 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 3 | 21,548 | 6 | 226,429 | 226 |
| synthesize:report | claude-sonnet-5 | 2 | 19,725 | 4 | 101,934 | 214 |
| judge:E13:spec-alignment | claude-sonnet-5 | 4 | 6,623 | 8 | 339,208 | 76 |
| judge:E13:domain-correctness | claude-sonnet-5 | 3 | 4,493 | 6 | 195,310 | 56 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 3 | 4,412 | 6 | 231,682 | 58 |
| triage | claude-sonnet-5 | 2 | 4,010 | 4 | 92,898 | 52 |
| judge:E13:spec-alignment | claude-sonnet-5 | 4 | 3,978 | 8 | 331,488 | 53 |
| refute:@better-auth%2Fapi-key@1.6.25.patch | claude-sonnet-5 | 13 | 3,837 | 26 | 1,274,700 | 148 |
| judge:E13:domain-correctness | claude-sonnet-5 | 3 | 3,731 | 6 | 200,643 | 46 |
| review:measurement | claude-opus-5-5 | 4 | 2,333 | 8 | 321,575 | 56 |
| triage | claude-sonnet-5 | 2 | 1,668 | 4 | 91,831 | 25 |
| review:conventions | claude-opus-5-5 | 8 | 1,639 | 16 | 697,704 | 76 |
| review:conventions | claude-opus-5-5 | 4 | 1,422 | 8 | 278,308 | 40 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 4 | 1,288 | 8 | 337,368 | 33 |
| judge:E14:domain-correctness | claude-sonnet-5 | 2 | 1,060 | 4 | 126,598 | 17 |
| judge:E14:spec-alignment | claude-sonnet-5 | 3 | 964 | 6 | 223,361 | 18 |
| judge:E14:domain-correctness | claude-sonnet-5 | 2 | 879 | 4 | 126,707 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 821 | 42 | 296,737 | 35 |
| judge:E14:operational-feasibility | claude-sonnet-5 | 3 | 820 | 6 | 223,392 | 17 |
| judge:E14:operational-feasibility | claude-sonnet-5 | 3 | 713 | 6 | 223,164 | 17 |
| judge:E14:spec-alignment | claude-sonnet-5 | 3 | 704 | 6 | 223,230 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 659 | 44 | 297,300 | 34 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 636 | 34 | 228,757 | 27 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 626 | 34 | 200,228 | 115 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 6 | 624 | 52 | 366,410 | 35 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 561 | 18 | 90,096 | 19 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 558 | 18 | 90,096 | 18 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 530 | 18 | 90,057 | 15 |
| review:bugs | claude-opus-5-5 | 14 | 523 | 28 | 1,443,398 | 113 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 520 | 18 | 90,141 | 16 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 478 | 18 | 90,096 | 18 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 473 | 18 | 90,141 | 24 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 459 | 18 | 90,061 | 21 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 423 | 18 | 90,180 | 18 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 420 | 18 | 90,180 | 17 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 414 | 18 | 90,180 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 413 | 34 | 227,317 | 28 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 408 | 18 | 90,057 | 22 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 386 | 18 | 90,055 | 14 |
| review:measurement | claude-opus-5-5 | 8 | 341 | 16 | 762,416 | 69 |
| capture:provenance | claude-sonnet-5 | 2 | 333 | 4 | 90,056 | 17 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 294 | 18 | 90,139 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 292 | 42 | 296,769 | 39 |
| capture:provenance | claude-sonnet-5 | 2 | 178 | 4 | 89,947 | 11 |
| review:bugs | claude-opus-5-5 | 11 | 150 | 22 | 1,083,266 | 74 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 90,145 | 25 |


wall: 1003s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 21 | 9,999 | 3,175,142 | 520 | 01:31:48 | 01:40:28 |
| judge | 12 | 29,665 | 2,782,151 | 516 | 01:31:48 | 01:40:24 |
| review | 6 | 6,408 | 4,586,667 | 530 | 01:32:10 | 01:41:00 |
| triage | 2 | 5,678 | 184,729 | 433 | 01:34:40 | 01:41:54 |
| capture | 2 | 511 | 180,003 | 576 | 01:35:07 | 01:44:43 |
| synthesize | 2 | 41,273 | 328,363 | 792 | 01:35:19 | 01:48:31 |
| refute | 1 | 3,837 | 1,274,700 | 148 | 01:41:55 | 01:44:23 |

- **claude-sonnet-5**: 19 agent · 63 calls · out 80,964 · in 126 · cache_read 4,749,946 · cache_create 1,679,022
- **claude-opus-5-5**: 6 agent · 49 calls · out 6,408 · in 98 · cache_read 4,586,667 · cache_create 548,306
- **claude-haiku-4-5-20251001**: 21 agent · 61 calls · out 9,999 · in 534 · cache_read 3,175,142 · cache_create 946,676

### S4 round 3 — wf_7f5e13e2-d8c (22 agent, 56,604 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 17,673 | 4 | 104,556 | 188 |
| triage | claude-sonnet-5 | 2 | 5,361 | 4 | 93,515 | 58 |
| judge:E13:domain-correctness | claude-sonnet-5 | 3 | 5,312 | 6 | 204,820 | 62 |
| judge:E13:spec-alignment | claude-sonnet-5 | 4 | 5,206 | 8 | 333,954 | 65 |
| refute:khoa-api-ghi-thua.spec.ts | claude-sonnet-5 | 26 | 5,182 | 52 | 2,855,582 | 248 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 3 | 2,963 | 6 | 242,472 | 49 |
| refute:khoa-api-ghi-thua.spec.ts | claude-sonnet-5 | 12 | 2,310 | 24 | 1,243,230 | 119 |
| refute:khoa-api-ghi-thua.spec.ts | claude-sonnet-5 | 11 | 2,266 | 22 | 1,072,114 | 163 |
| review:measurement | claude-opus-5-5 | 6 | 2,164 | 12 | 558,773 | 55 |
| baseline:diffBase | claude-sonnet-5 | 32 | 1,689 | 64 | 3,385,593 | 263 |
| review:conventions | claude-opus-5-5 | 6 | 1,506 | 12 | 504,919 | 53 |
| review:bugs | claude-opus-5-5 | 8 | 1,232 | 16 | 741,467 | 57 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 745 | 18 | 90,204 | 17 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 2 | 633 | 18 | 90,208 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 6 | 463 | 50 | 370,540 | 43 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 411 | 26 | 130,785 | 116 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 345 | 42 | 297,042 | 35 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 6 | 342 | 50 | 385,569 | 36 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 281 | 18 | 90,204 | 23 |
| capture:provenance | claude-sonnet-5 | 2 | 281 | 4 | 90,122 | 17 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 232 | 18 | 90,202 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 7 | 34 | 230,781 | 33 |


wall: 691s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,689 | 3,385,593 | 263 | 03:00:36 | 03:04:59 |
| machine | 9 | 3,459 | 1,775,535 | 172 | 03:00:36 | 03:03:28 |
| judge | 3 | 13,481 | 781,246 | 67 | 03:00:36 | 03:01:43 |
| review | 3 | 4,902 | 1,805,159 | 82 | 03:00:36 | 03:01:58 |
| triage | 1 | 5,361 | 93,515 | 58 | 03:03:30 | 03:04:27 |
| refute | 3 | 9,758 | 5,170,926 | 250 | 03:04:29 | 03:08:39 |
| capture | 1 | 281 | 90,122 | 17 | 03:08:41 | 03:08:58 |
| synthesize | 1 | 17,673 | 104,556 | 188 | 03:09:00 | 03:12:08 |

- **claude-sonnet-5**: 10 agent · 97 calls · out 48,243 · in 194 · cache_read 9,625,958 · cache_create 1,034,401
- **claude-opus-5-5**: 3 agent · 20 calls · out 4,902 · in 40 · cache_read 1,805,159 · cache_create 292,031
- **claude-haiku-4-5-20251001**: 9 agent · 32 calls · out 3,459 · in 274 · cache_read 1,775,535 · cache_create 429,919

### S4 round 4 — wf_286edbc2-0d0 (20 agent, 66,492 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 27,922 | 4 | 106,011 | 282 |
| judge:E13:domain-correctness | claude-sonnet-5 | 2 | 7,617 | 4 | 91,087 | 82 |
| judge:E13:spec-alignment | claude-sonnet-5 | 3 | 5,895 | 6 | 237,357 | 67 |
| triage | claude-sonnet-5 | 2 | 5,657 | 4 | 94,191 | 73 |
| judge:E13:operational-feasibility | claude-sonnet-5 | 4 | 5,287 | 8 | 332,841 | 71 |
| baseline:diffBase | claude-sonnet-5 | 31 | 3,557 | 62 | 3,292,255 | 867 |
| refute:khoa-api-ghi-thua.spec.ts | claude-sonnet-5 | 11 | 2,265 | 22 | 1,104,392 | 115 |
| review:bugs | claude-opus-5-5 | 12 | 1,812 | 24 | 1,303,970 | 118 |
| review:measurement | claude-opus-5-5 | 6 | 1,344 | 12 | 540,415 | 54 |
| review:conventions | claude-opus-5-5 | 9 | 1,134 | 18 | 856,193 | 73 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 558 | 26 | 130,792 | 112 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 4 | 501 | 34 | 228,433 | 39 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 3 | 433 | 26 | 158,753 | 25 |
| capture:provenance | claude-sonnet-5 | 2 | 429 | 4 | 90,170 | 12 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 4 | 377 | 34 | 225,948 | 31 |
| machine:bunx turbo run check-types --force | claude-haiku-4-5-20251001 | 3 | 364 | 26 | 157,856 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 354 | 42 | 296,282 | 30 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 3 | 351 | 26 | 157,856 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 338 | 18 | 90,249 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 5 | 297 | 42 | 301,945 | 36 |


wall: 1168s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,557 | 3,292,255 | 867 | 03:27:19 | 03:41:46 |
| machine | 9 | 3,573 | 1,748,114 | 176 | 03:27:19 | 03:30:15 |
| judge | 3 | 18,799 | 661,285 | 82 | 03:27:19 | 03:28:40 |
| review | 3 | 4,290 | 2,700,578 | 119 | 03:27:19 | 03:29:18 |
| triage | 1 | 5,657 | 94,191 | 73 | 03:30:17 | 03:31:31 |
| refute | 1 | 2,265 | 1,104,392 | 115 | 03:31:32 | 03:33:27 |
| capture | 1 | 429 | 90,170 | 12 | 03:41:48 | 03:42:00 |
| synthesize | 1 | 27,922 | 106,011 | 282 | 03:42:05 | 03:46:47 |

- **claude-sonnet-5**: 8 agent · 57 calls · out 58,629 · in 114 · cache_read 5,348,304 · cache_create 954,240
- **claude-opus-5-5**: 3 agent · 27 calls · out 4,290 · in 54 · cache_read 2,700,578 · cache_create 301,156
- **claude-haiku-4-5-20251001**: 9 agent · 32 calls · out 3,573 · in 274 · cache_read 1,748,114 · cache_create 416,539

