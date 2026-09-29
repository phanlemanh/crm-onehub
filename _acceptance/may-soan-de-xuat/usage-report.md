### S3 execute-parallel (Task 3, 4, 8) — wf_eb5647d6-fda (3 agent, 93,188 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| exec:Task 8 | claude-opus-5-5 | 59 | 40,904 | 118 | 10,001,706 | 564 |
| exec:Task 3 | claude-opus-5-5 | 37 | 32,717 | 74 | 5,317,294 | 389 |
| exec:Task 4 | claude-opus-5-5 | 30 | 19,567 | 60 | 4,039,369 | 239 |


wall: 566s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| exec | 3 | 93,188 | 19,358,369 | 566 | 02:07:35 | 02:17:00 |

- **claude-opus-5-5**: 3 agent · 126 calls · out 93,188 · in 252 · cache_read 19,358,369 · cache_create 556,098

### S4 round 1 — wf_a093408a-0a7 (85 agent, 579,807 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 5 | 32,326 | 10 | 667,557 | 305 |
| review:measurement | claude-opus-5-5 | 44 | 30,564 | 88 | 9,476,903 | 410 |
| review:bugs | claude-opus-5-5 | 33 | 28,539 | 66 | 6,781,010 | 367 |
| review:measurement | claude-opus-5-5 | 44 | 28,258 | 88 | 8,919,630 | 411 |
| review:bugs | claude-opus-5-5 | 38 | 26,744 | 76 | 7,766,609 | 361 |
| baseline:diffBase | claude-sonnet-5 | 45 | 26,627 | 90 | 6,333,779 | 2412 |
| baseline:diffBase | claude-sonnet-5 | 41 | 23,507 | 82 | 5,911,634 | 565 |
| judge:E15j:spec-alignment | claude-sonnet-5 | 6 | 22,374 | 12 | 720,975 | 231 |
| triage | claude-sonnet-5 | 2 | 20,314 | 4 | 116,922 | 224 |
| review:conventions | claude-opus-5-5 | 39 | 18,899 | 78 | 6,800,591 | 274 |
| triage | claude-sonnet-5 | 2 | 18,665 | 4 | 116,950 | 193 |
| ui:E11u | claude-sonnet-5 | 22 | 18,312 | 44 | 3,193,344 | 641 |
| judge:E15j:domain-correctness | claude-sonnet-5 | 3 | 17,945 | 6 | 242,104 | 203 |
| review:conventions | claude-opus-5-5 | 34 | 17,762 | 68 | 6,457,283 | 265 |
| ui:E11u | claude-sonnet-5 | 20 | 15,287 | 40 | 2,617,855 | 588 |
| judge:E15j:domain-correctness | claude-sonnet-5 | 3 | 14,920 | 6 | 252,768 | 155 |
| judge:E15j:operational-feasibility | claude-sonnet-5 | 7 | 14,857 | 14 | 890,508 | 173 |
| judge:E15j:spec-alignment | claude-sonnet-5 | 8 | 14,656 | 16 | 1,001,382 | 179 |
| ui:E2u | claude-sonnet-5 | 14 | 14,486 | 28 | 1,870,074 | 214 |
| judge:E15j:operational-feasibility | claude-sonnet-5 | 3 | 13,645 | 6 | 285,836 | 157 |
| ui:E2u | claude-sonnet-5 | 25 | 13,073 | 50 | 3,205,564 | 593 |
| refute:blob-that.mjs | claude-sonnet-5 | 10 | 11,000 | 20 | 1,139,022 | 154 |
| refute:dung-mau-tai-lieu.ts | claude-sonnet-5 | 9 | 9,625 | 18 | 1,054,921 | 125 |
| refute:tai-lieu-soan.integration.spec.ts | claude-sonnet-5 | 12 | 7,331 | 24 | 1,393,384 | 112 |
| refute:tai-lieu-nguon.service.ts | claude-sonnet-5 | 8 | 6,818 | 16 | 863,665 | 97 |
| refute:tai-lieu-nguon.spec.ts | claude-sonnet-5 | 10 | 5,742 | 20 | 1,121,689 | 86 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 4,834 | 18 | 106,777 | 59 |
| refute:tai-lieu-phien.ts | claude-sonnet-5 | 13 | 4,343 | 26 | 1,488,799 | 79 |
| refute:tai-lieu-nguon.spec.ts | claude-sonnet-5 | 10 | 4,104 | 20 | 1,116,534 | 69 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 4,100 | 18 | 106,759 | 43 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 4,086 | 18 | 106,815 | 41 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,981 | 18 | 106,833 | 41 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,701 | 18 | 106,817 | 39 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,451 | 18 | 106,757 | 38 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 4 | 3,190 | 34 | 229,504 | 639 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,047 | 18 | 106,814 | 40 |
| refute:tai-lieu-nguon.spec.ts | claude-sonnet-5 | 5 | 2,847 | 10 | 510,978 | 48 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,557 | 18 | 106,811 | 28 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 2,002 | 18 | 24,952 | 460 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 2,000 | 18 | 106,856 | 25 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,996 | 18 | 106,772 | 28 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,945 | 18 | 106,835 | 25 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 1,837 | 18 | 106,834 | 25 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 1,777 | 18 | 106,914 | 21 |
| machine:node _acceptance/may-soan-de-xuat/rang/m | claude-haiku-4-5-20251001 | 2 | 1,771 | 18 | 106,750 | 22 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,769 | 18 | 106,725 | 39 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,751 | 18 | 106,830 | 23 |
| machine:bun _acceptance/may-soan-de-xuat/rang/mi | claude-haiku-4-5-20251001 | 2 | 1,746 | 18 | 106,756 | 25 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 1,709 | 18 | 106,776 | 24 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,633 | 18 | 106,772 | 25 |
| machine:bun _acceptance/may-soan-de-xuat/rang/mi | claude-haiku-4-5-20251001 | 2 | 1,617 | 18 | 106,814 | 22 |
| machine:node _acceptance/may-soan-de-xuat/rang/m | claude-haiku-4-5-20251001 | 2 | 1,575 | 18 | 106,808 | 19 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,521 | 18 | 106,751 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,494 | 18 | 81,831 | 21 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,448 | 18 | 106,811 | 20 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,445 | 18 | 106,809 | 20 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,436 | 18 | 106,725 | 20 |
| machine:node _acceptance/may-soan-de-xuat/rang/b | claude-haiku-4-5-20251001 | 2 | 1,406 | 18 | 106,751 | 19 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,401 | 18 | 106,766 | 18 |
| machine:cd apps/agent && bun test test/tai-lieu- | claude-haiku-4-5-20251001 | 2 | 1,301 | 18 | 106,817 | 17 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,257 | 18 | 106,765 | 17 |
| machine:node _acceptance/may-soan-de-xuat/rang/b | claude-haiku-4-5-20251001 | 2 | 1,246 | 18 | 106,809 | 17 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,227 | 18 | 24,952 | 332 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,226 | 18 | 106,775 | 20 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,225 | 18 | 106,821 | 18 |
| machine:node _acceptance/may-soan-de-xuat/rang/q | claude-haiku-4-5-20251001 | 2 | 1,213 | 18 | 106,753 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,182 | 18 | 106,756 | 18 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,172 | 18 | 106,783 | 28 |
| machine:node _acceptance/may-soan-de-xuat/rang/q | claude-haiku-4-5-20251001 | 2 | 1,165 | 18 | 106,811 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,159 | 18 | 106,830 | 20 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,138 | 18 | 106,823 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,128 | 18 | 106,815 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,121 | 18 | 106,755 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,109 | 18 | 106,723 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,056 | 18 | 106,824 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,047 | 18 | 106,823 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,034 | 18 | 106,813 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,022 | 18 | 106,757 | 19 |
| machine:cd apps/agent && bun test test/tai-lieu- | claude-haiku-4-5-20251001 | 2 | 979 | 18 | 106,759 | 14 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 979 | 18 | 106,753 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 978 | 18 | 106,753 | 17 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 975 | 18 | 106,781 | 14 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 945 | 18 | 106,765 | 15 |
| capture:provenance | claude-sonnet-5 | 2 | 746 | 4 | 109,027 | 11 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 381 | 18 | 106,763 | 14 |


wall: 3701s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 2 | 50,134 | 12,245,413 | 2991 | 05:29:54 | 06:19:45 |
| machine | 55 | 95,491 | 5,807,504 | 2928 | 05:29:54 | 06:18:43 |
| ui | 4 | 61,158 | 10,886,837 | 3066 | 05:30:41 | 06:21:47 |
| judge | 6 | 98,397 | 3,393,573 | 2623 | 05:30:46 | 06:14:29 |
| review | 6 | 150,766 | 46,202,026 | 2837 | 05:30:52 | 06:18:09 |
| triage | 2 | 38,979 | 233,872 | 2622 | 05:41:18 | 06:25:00 |
| refute | 8 | 51,810 | 8,688,992 | 2477 | 05:45:02 | 06:26:19 |
| capture | 1 | 746 | 109,027 | 11 | 06:26:19 | 06:26:30 |
| synthesize | 1 | 32,326 | 667,557 | 305 | 06:26:30 | 06:31:35 |

- **claude-sonnet-5**: 24 agent · 285 calls · out 333,550 · in 570 · cache_read 36,225,271 · cache_create 3,526,145
- **claude-opus-5-5**: 6 agent · 232 calls · out 150,766 · in 464 · cache_read 46,202,026 · cache_create 1,462,483
- **claude-haiku-4-5-20251001**: 55 agent · 112 calls · out 95,491 · in 1,006 · cache_read 5,807,504 · cache_create 3,792,985

### S4 round 2 — wf_d8747142-2af (40 agent, 239,140 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 9 | 40,835 | 18 | 1,396,559 | 444 |
| baseline:diffBase | claude-sonnet-5 | 46 | 37,834 | 92 | 6,957,193 | 519 |
| ui:E2u | claude-sonnet-5 | 28 | 17,306 | 56 | 4,390,002 | 536 |
| judge:E15j:operational-feasibility | claude-sonnet-5 | 5 | 16,306 | 10 | 615,670 | 252 |
| judge:E15j:spec-alignment | claude-sonnet-5 | 6 | 15,995 | 12 | 770,524 | 187 |
| ui:E11u | claude-sonnet-5 | 22 | 15,365 | 44 | 3,154,772 | 452 |
| review:bugs | claude-opus-5-5 | 22 | 11,834 | 44 | 3,153,848 | 164 |
| judge:E15j:domain-correctness | claude-sonnet-5 | 4 | 10,136 | 8 | 417,101 | 115 |
| review:measurement | claude-opus-5-5 | 15 | 9,671 | 30 | 2,006,105 | 124 |
| triage | claude-sonnet-5 | 2 | 7,894 | 4 | 113,383 | 97 |
| review:conventions | claude-opus-5-5 | 14 | 7,860 | 28 | 1,821,592 | 104 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,696 | 18 | 106,557 | 42 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,526 | 18 | 106,551 | 37 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,454 | 18 | 106,555 | 40 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 3,447 | 18 | 106,576 | 295 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,339 | 18 | 106,523 | 48 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 2,135 | 18 | 106,570 | 27 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,793 | 18 | 106,570 | 26 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 1,767 | 18 | 106,654 | 20 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,639 | 18 | 106,575 | 27 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,637 | 18 | 106,573 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,490 | 18 | 106,553 | 21 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,483 | 18 | 106,523 | 20 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 1,475 | 18 | 106,574 | 21 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,370 | 18 | 106,549 | 24 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,283 | 18 | 24,952 | 332 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,266 | 18 | 106,563 | 17 |
| machine:node _acceptance/may-soan-de-xuat/rang/q | claude-haiku-4-5-20251001 | 2 | 1,244 | 18 | 106,551 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,191 | 18 | 106,554 | 18 |
| machine:bun _acceptance/may-soan-de-xuat/rang/mi | claude-haiku-4-5-20251001 | 2 | 1,180 | 18 | 106,554 | 21 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,133 | 18 | 106,551 | 16 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,105 | 18 | 106,561 | 15 |
| machine:node _acceptance/may-soan-de-xuat/rang/m | claude-haiku-4-5-20251001 | 2 | 1,091 | 18 | 106,548 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,079 | 18 | 106,521 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,060 | 18 | 106,555 | 21 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,046 | 18 | 106,564 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 980 | 18 | 106,563 | 13 |
| capture:provenance | claude-sonnet-5 | 2 | 771 | 4 | 108,799 | 13 |
| machine:cd apps/agent && bun test test/tai-lieu- | claude-haiku-4-5-20251001 | 2 | 719 | 18 | 106,557 | 15 |
| machine:node _acceptance/may-soan-de-xuat/rang/b | claude-haiku-4-5-20251001 | 2 | 705 | 18 | 106,549 | 18 |


wall: 1134s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 37,834 | 6,957,193 | 519 | 06:46:06 | 06:54:45 |
| machine | 28 | 47,333 | 2,902,046 | 415 | 06:46:06 | 06:53:01 |
| ui | 2 | 32,671 | 7,544,774 | 536 | 06:46:50 | 06:55:46 |
| judge | 3 | 42,437 | 1,803,295 | 256 | 06:46:56 | 06:51:12 |
| review | 3 | 29,365 | 6,981,545 | 166 | 06:47:04 | 06:49:50 |
| triage | 1 | 7,894 | 113,383 | 97 | 06:55:47 | 06:57:24 |
| capture | 1 | 771 | 108,799 | 13 | 06:57:24 | 06:57:37 |
| synthesize | 1 | 40,835 | 1,396,559 | 444 | 06:57:37 | 07:05:01 |

- **claude-sonnet-5**: 9 agent · 124 calls · out 162,442 · in 248 · cache_read 17,924,003 · cache_create 1,403,662
- **claude-opus-5-5**: 3 agent · 51 calls · out 29,365 · in 102 · cache_read 6,981,545 · cache_create 443,758
- **claude-haiku-4-5-20251001**: 28 agent · 56 calls · out 47,333 · in 504 · cache_read 2,902,046 · cache_create 1,879,404

### S4 round 2 (thử lại hạ tầng) — wf_0657de35-9c8 (35 agent, 106,606 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 4 | 30,367 | 8 | 461,401 | 322 |
| ui:E2u | claude-sonnet-5 | 23 | 17,892 | 46 | 3,157,279 | 785 |
| ui:E11u | claude-sonnet-5 | 29 | 12,896 | 58 | 3,984,861 | 737 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,517 | 18 | 106,524 | 46 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,330 | 18 | 106,556 | 31 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,238 | 18 | 106,574 | 30 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 2,164 | 18 | 49,904 | 569 |
| review:conventions | claude-opus-5-5 | 7 | 2,071 | 14 | 727,356 | 30 |
| review:bugs | claude-opus-5-5 | 7 | 1,938 | 14 | 749,815 | 31 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,638 | 18 | 106,576 | 24 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 1,607 | 18 | 106,655 | 19 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,584 | 18 | 106,571 | 27 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,526 | 18 | 106,558 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,513 | 18 | 106,554 | 20 |
| machine:node _acceptance/may-soan-de-xuat/rang/m | claude-haiku-4-5-20251001 | 2 | 1,480 | 18 | 106,549 | 18 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 1,468 | 18 | 106,575 | 22 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,420 | 18 | 106,564 | 19 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,417 | 18 | 106,571 | 28 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,354 | 18 | 106,524 | 18 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,227 | 18 | 106,552 | 17 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,208 | 18 | 106,564 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,207 | 18 | 106,555 | 19 |
| machine:bun _acceptance/may-soan-de-xuat/rang/mi | claude-haiku-4-5-20251001 | 2 | 1,186 | 18 | 106,555 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,144 | 18 | 106,556 | 20 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,113 | 18 | 106,550 | 20 |
| machine:node _acceptance/may-soan-de-xuat/rang/b | claude-haiku-4-5-20251001 | 2 | 1,104 | 18 | 106,550 | 14 |
| machine:node _acceptance/may-soan-de-xuat/rang/q | claude-haiku-4-5-20251001 | 2 | 1,091 | 18 | 106,552 | 15 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,042 | 18 | 81,679 | 294 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,040 | 18 | 106,522 | 14 |
| machine:cd apps/agent && bun test test/tai-lieu- | claude-haiku-4-5-20251001 | 2 | 1,024 | 18 | 106,558 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 931 | 18 | 106,552 | 16 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 889 | 18 | 106,562 | 13 |
| review:measurement | claude-opus-5-5 | 3 | 827 | 6 | 259,273 | 15 |
| capture:provenance | claude-sonnet-5 | 2 | 704 | 4 | 108,773 | 12 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 449 | 18 | 106,565 | 16 |


wall: 1157s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 28 | 39,911 | 2,902,127 | 605 | 07:05:57 | 07:16:03 |
| ui | 2 | 30,788 | 7,142,140 | 785 | 07:06:36 | 07:19:41 |
| review | 3 | 4,836 | 1,736,444 | 32 | 07:06:38 | 07:07:11 |
| capture | 1 | 704 | 108,773 | 12 | 07:19:41 | 07:19:52 |
| synthesize | 1 | 30,367 | 461,401 | 322 | 07:19:53 | 07:25:15 |

- **claude-sonnet-5**: 4 agent · 58 calls · out 61,859 · in 116 · cache_read 7,712,314 · cache_create 867,878
- **claude-haiku-4-5-20251001**: 28 agent · 56 calls · out 39,911 · in 504 · cache_read 2,902,127 · cache_create 1,877,857
- **claude-opus-5-5**: 3 agent · 17 calls · out 4,836 · in 34 · cache_read 1,736,444 · cache_create 316,212

### S4 round 3 — wf_cb1a646d-c5c (43 agent, 217,542 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 36,781 | 4 | 144,888 | 365 |
| baseline:diffBase | claude-sonnet-5 | 38 | 20,691 | 76 | 5,471,859 | 587 |
| ui:E11u | claude-sonnet-5 | 19 | 19,023 | 38 | 2,534,568 | 564 |
| ui:E2u | claude-sonnet-5 | 23 | 13,668 | 46 | 3,110,459 | 542 |
| refute:tai-lieu-nguon-cua-ai.spec.ts | claude-sonnet-5 | 13 | 13,516 | 26 | 1,617,098 | 186 |
| refute:tai-lieu-nguon-cua-ai.spec.ts | claude-sonnet-5 | 9 | 10,830 | 18 | 1,057,830 | 144 |
| refute:tai-lieu-nguon.service.ts | claude-sonnet-5 | 7 | 10,633 | 14 | 769,322 | 145 |
| review:measurement | claude-opus-5-5 | 9 | 10,032 | 18 | 1,122,460 | 116 |
| triage | claude-sonnet-5 | 2 | 8,871 | 4 | 113,991 | 106 |
| refute:tai-lieu-nguon-cua-ai.spec.ts | claude-sonnet-5 | 15 | 7,525 | 30 | 1,774,707 | 120 |
| review:conventions | claude-opus-5-5 | 9 | 6,173 | 18 | 1,061,648 | 79 |
| refute:tai-lieu-nguon.service.ts | claude-sonnet-5 | 7 | 5,502 | 14 | 791,065 | 81 |
| review:bugs | claude-opus-5-5 | 8 | 4,321 | 16 | 964,644 | 63 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,688 | 18 | 106,611 | 40 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,489 | 18 | 106,580 | 49 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 3,006 | 18 | 106,627 | 35 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,852 | 18 | 106,614 | 36 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,604 | 18 | 106,612 | 35 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,546 | 18 | 106,612 | 35 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 2,237 | 18 | 81,735 | 226 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 4 | 2,224 | 34 | 220,704 | 358 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 2,105 | 18 | 106,606 | 31 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 1,980 | 18 | 106,631 | 27 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,803 | 18 | 106,608 | 26 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,765 | 18 | 106,580 | 22 |
| machine:node _acceptance/may-soan-de-xuat/rang/m | claude-haiku-4-5-20251001 | 2 | 1,606 | 18 | 106,605 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,593 | 18 | 106,610 | 23 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 1,454 | 18 | 106,711 | 19 |
| machine:node _acceptance/may-soan-de-xuat/rang/b | claude-haiku-4-5-20251001 | 2 | 1,437 | 18 | 106,606 | 18 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,333 | 18 | 106,632 | 25 |
| machine:bun _acceptance/may-soan-de-xuat/rang/mi | claude-haiku-4-5-20251001 | 2 | 1,303 | 18 | 106,611 | 24 |
| machine:node _acceptance/may-soan-de-xuat/rang/q | claude-haiku-4-5-20251001 | 2 | 1,290 | 18 | 106,608 | 17 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,155 | 18 | 106,618 | 17 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,124 | 18 | 106,620 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,016 | 18 | 106,608 | 17 |
| machine:cd apps/agent && bun test test/tai-lieu- | claude-haiku-4-5-20251001 | 2 | 1,014 | 18 | 106,614 | 13 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 981 | 18 | 106,620 | 14 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 981 | 18 | 106,621 | 15 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 914 | 18 | 106,627 | 25 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 687 | 18 | 106,578 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 671 | 18 | 106,630 | 24 |
| capture:provenance | claude-sonnet-5 | 2 | 631 | 4 | 108,809 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 487 | 18 | 106,610 | 18 |


wall: 1289s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 20,691 | 5,471,859 | 587 | 08:27:39 | 08:37:26 |
| machine | 29 | 49,345 | 3,181,049 | 410 | 08:27:39 | 08:34:29 |
| ui | 2 | 32,691 | 5,645,027 | 567 | 08:28:31 | 08:37:58 |
| review | 3 | 20,526 | 3,148,752 | 120 | 08:28:34 | 08:30:34 |
| triage | 1 | 8,871 | 113,991 | 106 | 08:37:58 | 08:39:44 |
| refute | 5 | 48,006 | 6,010,022 | 188 | 08:39:44 | 08:42:53 |
| capture | 1 | 631 | 108,809 | 10 | 08:42:53 | 08:43:03 |
| synthesize | 1 | 36,781 | 144,888 | 365 | 08:43:03 | 08:49:08 |

- **claude-sonnet-5**: 11 agent · 137 calls · out 147,671 · in 274 · cache_read 17,494,596 · cache_create 1,547,274
- **claude-opus-5-5**: 3 agent · 26 calls · out 20,526 · in 52 · cache_read 3,148,752 · cache_create 389,522
- **claude-haiku-4-5-20251001**: 29 agent · 60 calls · out 49,345 · in 538 · cache_read 3,181,049 · cache_create 1,957,893

### S4 round 4 — wf_08351241-769 (38 agent, 167,235 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 5 | 37,180 | 10 | 630,332 | 379 |
| baseline:diffBase | claude-sonnet-5 | 46 | 20,891 | 92 | 6,587,210 | 650 |
| ui:E2u | claude-sonnet-5 | 19 | 13,248 | 38 | 2,614,946 | 591 |
| ui:E11u | claude-sonnet-5 | 19 | 12,838 | 38 | 2,612,053 | 578 |
| review:bugs | claude-opus-5-5 | 13 | 12,147 | 26 | 1,676,947 | 150 |
| review:measurement | claude-opus-5-5 | 9 | 9,979 | 18 | 1,080,551 | 121 |
| review:conventions | claude-opus-5-5 | 9 | 8,904 | 18 | 1,054,357 | 106 |
| triage | claude-sonnet-5 | 2 | 4,368 | 4 | 112,320 | 59 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 4,281 | 18 | 106,541 | 46 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,777 | 18 | 106,510 | 52 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,575 | 18 | 106,542 | 40 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 3 | 2,030 | 28 | 195,512 | 28 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,010 | 18 | 106,538 | 27 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,992 | 18 | 106,557 | 28 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,808 | 18 | 106,510 | 24 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,786 | 18 | 49,904 | 371 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,627 | 18 | 24,952 | 350 |
| machine:node _acceptance/may-soan-de-xuat/rang/b | claude-haiku-4-5-20251001 | 2 | 1,582 | 18 | 106,536 | 18 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,571 | 18 | 106,536 | 25 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 1,485 | 18 | 106,561 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,424 | 18 | 106,560 | 24 |
| machine:node _acceptance/may-soan-de-xuat/rang/m | claude-haiku-4-5-20251001 | 2 | 1,393 | 18 | 106,535 | 17 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 1,346 | 18 | 106,562 | 23 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,282 | 18 | 106,540 | 18 |
| machine:bun _acceptance/may-soan-de-xuat/rang/mi | claude-haiku-4-5-20251001 | 2 | 1,232 | 18 | 106,541 | 21 |
| machine:cd apps/agent && bun test test/tai-lieu- | claude-haiku-4-5-20251001 | 2 | 1,193 | 18 | 106,544 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,111 | 18 | 106,550 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,101 | 18 | 106,548 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,100 | 18 | 106,542 | 21 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,095 | 18 | 106,550 | 15 |
| machine:node _acceptance/may-soan-de-xuat/rang/q | claude-haiku-4-5-20251001 | 2 | 1,071 | 18 | 106,538 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,053 | 18 | 106,540 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,023 | 18 | 106,544 | 20 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,015 | 18 | 106,551 | 15 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 962 | 18 | 106,538 | 16 |
| capture:provenance | claude-sonnet-5 | 2 | 962 | 4 | 108,790 | 15 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 952 | 18 | 106,641 | 23 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 841 | 18 | 106,508 | 13 |


wall: 1090s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 20,891 | 6,587,210 | 650 | 09:02:50 | 09:13:39 |
| machine | 29 | 46,718 | 3,040,531 | 438 | 09:02:50 | 09:10:08 |
| ui | 2 | 26,086 | 5,226,999 | 591 | 09:03:36 | 09:13:27 |
| review | 3 | 31,030 | 3,811,855 | 152 | 09:03:40 | 09:06:12 |
| triage | 1 | 4,368 | 112,320 | 59 | 09:13:27 | 09:14:27 |
| capture | 1 | 962 | 108,790 | 15 | 09:14:27 | 09:14:41 |
| synthesize | 1 | 37,180 | 630,332 | 379 | 09:14:41 | 09:21:00 |

- **claude-sonnet-5**: 6 agent · 93 calls · out 89,487 · in 186 · cache_read 12,665,651 · cache_create 1,193,707
- **claude-opus-5-5**: 3 agent · 31 calls · out 31,030 · in 62 · cache_read 3,811,855 · cache_create 386,706
- **claude-haiku-4-5-20251001**: 29 agent · 59 calls · out 46,718 · in 532 · cache_read 3,040,531 · cache_create 2,005,402


### S4 round 5 — wf_dbb829b1-b34 — wf_dbb829b1-b34 (38 agent, 200,061 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 11 | 44,419 | 22 | 1,635,407 | 461 |
| baseline:diffBase | claude-sonnet-5 | 57 | 33,333 | 114 | 8,684,819 | 687 |
| ui:E11u | claude-sonnet-5 | 22 | 22,321 | 44 | 3,283,305 | 562 |
| ui:E2u | claude-sonnet-5 | 22 | 18,383 | 44 | 3,317,427 | 569 |
| review:bugs | claude-opus-5-5 | 16 | 14,929 | 32 | 2,096,901 | 182 |
| review:measurement | claude-opus-5-5 | 8 | 9,889 | 16 | 939,642 | 112 |
| review:conventions | claude-opus-5-5 | 11 | 6,752 | 22 | 1,313,107 | 86 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,544 | 18 | 106,817 | 50 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,512 | 18 | 106,845 | 36 |
| triage | claude-sonnet-5 | 2 | 3,327 | 4 | 112,072 | 49 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 3,103 | 18 | 106,849 | 36 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,588 | 18 | 106,848 | 30 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 2,585 | 18 | 49,904 | 353 |
| machine:bash _acceptance/tieu-de-cot-doc-tron/ra | claude-haiku-4-5-20251001 | 2 | 2,194 | 18 | 106,869 | 33 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,946 | 18 | 106,864 | 26 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,887 | 18 | 24,952 | 355 |
| machine:for t in $(git ls-files "apps/app/app/(a | claude-haiku-4-5-20251001 | 2 | 1,676 | 18 | 106,948 | 22 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,649 | 18 | 106,845 | 23 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,564 | 18 | 106,857 | 20 |
| machine:node _acceptance/may-soan-de-xuat/rang/m | claude-haiku-4-5-20251001 | 2 | 1,557 | 18 | 106,842 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,433 | 18 | 106,851 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,432 | 18 | 106,867 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,404 | 18 | 106,817 | 19 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-4-5-20251001 | 2 | 1,385 | 18 | 106,843 | 22 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-4-5-20251001 | 2 | 1,267 | 18 | 106,864 | 20 |
| machine:node _acceptance/may-soan-de-xuat/rang/b | claude-haiku-4-5-20251001 | 2 | 1,262 | 18 | 106,843 | 15 |
| machine:bun _acceptance/may-soan-de-xuat/rang/mi | claude-haiku-4-5-20251001 | 2 | 1,243 | 18 | 106,848 | 20 |
| machine:node _acceptance/may-soan-de-xuat/rang/q | claude-haiku-4-5-20251001 | 2 | 1,035 | 18 | 106,845 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 1,018 | 18 | 106,858 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 963 | 18 | 106,857 | 14 |
| machine:cd apps/agent && bun test test/tai-lieu- | claude-haiku-4-5-20251001 | 2 | 922 | 18 | 106,851 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 867 | 18 | 106,815 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 843 | 18 | 106,847 | 15 |
| machine:cd apps/app && bun test --preload ../../ | claude-haiku-4-5-20251001 | 2 | 841 | 18 | 106,855 | 12 |
| machine:cd packages/validation && bun test test/ | claude-haiku-4-5-20251001 | 2 | 830 | 18 | 106,868 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 782 | 18 | 106,849 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 750 | 18 | 106,847 | 13 |
| capture:provenance | claude-sonnet-5 | 2 | 626 | 4 | 109,077 | 11 |


wall: 1159s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 33,333 | 8,684,819 | 687 | 10:29:31 | 10:40:58 |
| machine | 29 | 46,082 | 2,959,865 | 437 | 10:29:31 | 10:36:48 |
| ui | 2 | 40,704 | 6,600,732 | 569 | 10:30:19 | 10:39:49 |
| review | 3 | 31,570 | 4,349,650 | 184 | 10:30:23 | 10:33:27 |
| triage | 1 | 3,327 | 112,072 | 49 | 10:39:49 | 10:40:38 |
| capture | 1 | 626 | 109,077 | 11 | 10:40:58 | 10:41:10 |
| synthesize | 1 | 44,419 | 1,635,407 | 461 | 10:41:10 | 10:48:51 |

- **claude-sonnet-5**: 6 agent · 116 calls · out 122,409 · in 232 · cache_read 17,142,107 · cache_create 950,828
- **claude-opus-5-5**: 3 agent · 35 calls · out 31,570 · in 70 · cache_read 4,349,650 · cache_create 387,163
- **claude-haiku-4-5-20251001**: 29 agent · 58 calls · out 46,082 · in 522 · cache_read 2,959,865 · cache_create 2,011,118

