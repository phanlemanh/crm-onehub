### S4 round 1 — wf_7ac09640-9e5 (50 agent, 264,375 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 49 | 34,947 | 98 | 10,336,286 | 638 |
| review:measurement | claude-opus-5-5 | 38 | 28,489 | 76 | 7,006,361 | 428 |
| synthesize:report | claude-sonnet-5-5 | 3 | 23,807 | 6 | 287,734 | 177 |
| ui:E12b | claude-sonnet-5-5 | 26 | 20,842 | 52 | 3,249,428 | 1073 |
| ui:E2 | claude-sonnet-5-5 | 23 | 18,949 | 46 | 2,651,541 | 1717 |
| ui:E14 | claude-sonnet-5-5 | 21 | 12,804 | 42 | 2,422,235 | 805 |
| ui:E1b | claude-sonnet-5-5 | 21 | 11,740 | 42 | 2,353,696 | 989 |
| review:conventions | claude-opus-5-5 | 27 | 10,645 | 54 | 3,838,911 | 201 |
| ui:E8c | claude-sonnet-5-5 | 12 | 9,366 | 24 | 1,108,112 | 901 |
| ui:E9b | claude-sonnet-5-5 | 15 | 8,039 | 30 | 1,679,553 | 557 |
| triage | claude-sonnet-5-5 | 3 | 6,939 | 6 | 217,651 | 212 |
| baseline:diffBase | claude-sonnet-5-5 | 9 | 6,671 | 18 | 899,137 | 85 |
| ui:E11b | claude-sonnet-5-5 | 10 | 6,139 | 20 | 1,025,636 | 489 |
| ui:E10c | claude-sonnet-5-5 | 11 | 5,491 | 22 | 1,126,712 | 367 |
| refute:man.mjs | claude-sonnet-5-5 | 12 | 4,962 | 24 | 1,229,241 | 96 |
| judge:E15:domain-correctness | claude-sonnet-5-5 | 2 | 3,613 | 4 | 95,517 | 47 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 3,350 | 18 | 100,238 | 50 |
| judge:E15:operational-feasibility | claude-sonnet-5-5 | 3 | 3,331 | 6 | 238,054 | 33 |
| judge:E15:spec-alignment | claude-sonnet-5-5 | 3 | 3,328 | 6 | 238,050 | 29 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 2,273 | 18 | 99,286 | 30 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 6 | 2,173 | 50 | 419,330 | 87 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 2 | 2,126 | 18 | 70,292 | 295 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 2 | 2,118 | 18 | 99,408 | 269 |
| refute:soan-okr-trang.dom.tsx | claude-sonnet-5-5 | 7 | 2,088 | 14 | 616,494 | 44 |
| refute:soan-okr-trang.dom.tsx | claude-sonnet-5-5 | 5 | 1,912 | 10 | 466,212 | 40 |
| refute:man-so.mjs | claude-sonnet-5-5 | 5 | 1,854 | 10 | 451,725 | 43 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,772 | 18 | 99,262 | 232 |
| machine:{ find "apps/app/app/(app)/[slug]/okr/so | claude-haiku-4-5-20251001 | 2 | 1,735 | 18 | 99,388 | 22 |
| machine:node _acceptance/soan-okr-trang-rieng/ra | claude-haiku-4-5-20251001 | 2 | 1,592 | 18 | 99,278 | 23 |
| refute:man.mjs | claude-sonnet-5-5 | 3 | 1,534 | 6 | 239,168 | 39 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 1,521 | 18 | 100,238 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,414 | 18 | 99,286 | 27 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 1,412 | 18 | 99,298 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,235 | 18 | 99,309 | 18 |
| machine:node _acceptance/soan-okr-trang-rieng/ra | claude-haiku-4-5-20251001 | 2 | 1,161 | 18 | 99,272 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,118 | 18 | 99,309 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,092 | 18 | 99,309 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,078 | 18 | 99,311 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,078 | 18 | 99,309 | 16 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 963 | 18 | 99,297 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 900 | 18 | 99,309 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 899 | 18 | 99,311 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 886 | 18 | 99,311 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 883 | 18 | 99,308 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 846 | 18 | 99,309 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 842 | 18 | 100,236 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 803 | 18 | 99,308 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 618 | 18 | 99,312 | 12 |
| machine:node _acceptance/soan-okr-trang-rieng/ra | claude-haiku-4-5-20251001 | 2 | 583 | 18 | 99,274 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 414 | 4 | 95,298 | 13 |


wall: 2250s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 6,671 | 899,137 | 85 | 20:50:22 | 20:51:47 |
| machine | 27 | 36,471 | 2,975,098 | 965 | 20:50:22 | 21:06:27 |
| ui | 8 | 93,370 | 15,616,913 | 1719 | 20:50:51 | 21:19:30 |
| judge | 3 | 10,272 | 571,621 | 70 | 20:51:04 | 20:52:14 |
| review | 3 | 74,081 | 21,181,558 | 643 | 20:51:47 | 21:02:30 |
| triage | 1 | 6,939 | 217,651 | 212 | 21:19:30 | 21:23:02 |
| refute | 5 | 12,350 | 3,002,840 | 99 | 21:23:02 | 21:24:41 |
| capture | 1 | 414 | 95,298 | 13 | 21:24:42 | 21:24:55 |
| synthesize | 1 | 23,807 | 287,734 | 177 | 21:24:55 | 21:27:52 |

- **claude-opus-5-5**: 3 agent · 114 calls · out 74,081 · in 228 · cache_read 21,181,558 · cache_create 647,091
- **claude-sonnet-5-5**: 20 agent · 196 calls · out 153,823 · in 392 · cache_read 20,691,194 · cache_create 2,698,501
- **claude-haiku-4-5-20251001**: 27 agent · 58 calls · out 36,471 · in 518 · cache_read 2,975,098 · cache_create 1,293,662

### S4 round 2 — wf_45b2457b-746 (45 agent, 200,013 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 44 | 26,665 | 88 | 8,266,221 | 375 |
| review:measurement | claude-opus-5-5 | 28 | 20,990 | 56 | 5,348,117 | 280 |
| synthesize:report | claude-sonnet-5-5 | 4 | 20,805 | 8 | 433,560 | 359 |
| ui:E2 | claude-sonnet-5-5 | 15 | 12,455 | 30 | 1,762,443 | 566 |
| ui:E11b | claude-sonnet-5-5 | 13 | 10,996 | 26 | 1,354,476 | 829 |
| ui:E14 | claude-sonnet-5-5 | 18 | 9,491 | 36 | 2,008,436 | 755 |
| review:conventions | claude-opus-5-5 | 15 | 7,025 | 30 | 1,957,491 | 101 |
| ui:E10c | claude-sonnet-5-5 | 15 | 6,919 | 30 | 1,548,230 | 845 |
| ui:E9b | claude-sonnet-5-5 | 16 | 6,890 | 32 | 1,747,318 | 957 |
| machine:bun run test -- --filter=api | claude-haiku-4-5-20251001 | 8 | 5,646 | 66 | 493,758 | 406 |
| ui:E8c | claude-sonnet-5-5 | 9 | 5,492 | 18 | 834,363 | 602 |
| ui:E1b | claude-sonnet-5-5 | 9 | 5,095 | 18 | 830,491 | 554 |
| baseline:diffBase | claude-sonnet-5-5 | 6 | 4,834 | 12 | 519,979 | 113 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-4-5-20251001 | 4 | 4,575 | 34 | 256,757 | 300 |
| ui:E12b | claude-sonnet-5-5 | 7 | 4,262 | 14 | 607,218 | 671 |
| judge:E15:domain-correctness | claude-sonnet-5-5 | 3 | 4,117 | 6 | 203,232 | 38 |
| judge:E15:spec-alignment | claude-sonnet-5-5 | 3 | 4,019 | 6 | 238,150 | 33 |
| judge:E15:operational-feasibility | claude-sonnet-5-5 | 4 | 3,959 | 8 | 353,954 | 39 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 7 | 2,857 | 58 | 489,812 | 40 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-4-5-20251001 | 2 | 2,611 | 18 | 100,272 | 84 |
| refute:the-nhap.tsx | claude-sonnet-5-5 | 7 | 2,582 | 14 | 629,279 | 34 |
| triage | claude-sonnet-5-5 | 2 | 2,523 | 4 | 99,627 | 22 |
| refute:man-so.mjs | claude-sonnet-5-5 | 5 | 2,240 | 10 | 452,143 | 46 |
| refute:soan-okr-trang.dom.tsx | claude-sonnet-5-5 | 8 | 2,112 | 16 | 780,754 | 33 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-4-5-20251001 | 2 | 1,677 | 18 | 100,251 | 238 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,665 | 18 | 99,284 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-4-5-20251001 | 2 | 1,588 | 18 | 99,284 | 25 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 1,516 | 18 | 100,225 | 38 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 1,172 | 18 | 99,307 | 16 |
| refute:soan-okr-trang.dom.tsx | claude-sonnet-5-5 | 4 | 1,101 | 8 | 337,182 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 980 | 18 | 99,309 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 978 | 18 | 99,309 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 972 | 18 | 99,307 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 961 | 18 | 99,307 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 941 | 18 | 99,309 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 940 | 18 | 99,306 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 908 | 18 | 99,307 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 896 | 18 | 99,306 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 884 | 18 | 99,307 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 780 | 18 | 99,307 | 11 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 768 | 18 | 99,295 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 743 | 18 | 99,310 | 11 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 695 | 18 | 100,223 | 13 |
| machine:bun run test -- "cd apps/app && export T | claude-haiku-4-5-20251001 | 2 | 359 | 18 | 99,296 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 329 | 4 | 95,310 | 7 |


wall: 1555s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,834 | 519,979 | 113 | 23:42:23 | 23:44:16 |
| machine | 23 | 35,112 | 3,230,148 | 1119 | 23:42:23 | 00:01:02 |
| ui | 8 | 61,600 | 10,692,975 | 965 | 23:42:39 | 23:58:44 |
| judge | 3 | 12,095 | 795,336 | 72 | 23:42:51 | 23:44:03 |
| review | 3 | 54,680 | 15,571,829 | 403 | 23:43:34 | 23:50:17 |
| triage | 1 | 2,523 | 99,627 | 22 | 00:01:02 | 00:01:24 |
| refute | 4 | 8,035 | 2,199,358 | 49 | 00:01:24 | 00:02:13 |
| capture | 1 | 329 | 95,310 | 7 | 00:02:13 | 00:02:19 |
| synthesize | 1 | 20,805 | 433,560 | 359 | 00:02:19 | 00:08:18 |

- **claude-opus-5-5**: 3 agent · 87 calls · out 54,680 · in 174 · cache_read 15,571,829 · cache_create 583,847
- **claude-sonnet-5-5**: 19 agent · 150 calls · out 110,221 · in 300 · cache_read 14,836,145 · cache_create 2,621,214
- **claude-haiku-4-5-20251001**: 23 agent · 59 calls · out 35,112 · in 518 · cache_read 3,230,148 · cache_create 1,161,425

