### S4 round 1 — wf_5d8cd22a-b7c (24 agent, 81,417 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 3 | 30,342 | 6 | 198,813 | 315 |
| ui:E10 | claude-sonnet-5 | 27 | 16,955 | 54 | 2,889,527 | 390 |
| triage | claude-sonnet-5 | 2 | 9,883 | 4 | 111,262 | 108 |
| review:measurement | claude-opus-5-5 | 17 | 6,278 | 34 | 2,226,386 | 253 |
| refute:detail-sheet.tsx | claude-sonnet-5 | 24 | 5,215 | 48 | 2,233,968 | 289 |
| baseline:diffBase | claude-sonnet-5 | 11 | 2,194 | 22 | 881,576 | 140 |
| review:bugs | claude-opus-5-5 | 37 | 1,988 | 74 | 4,785,509 | 329 |
| review:conventions | claude-opus-5-5 | 22 | 1,858 | 44 | 2,550,337 | 165 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 973 | 18 | 75,315 | 21 |
| capture:provenance | claude-sonnet-5 | 2 | 570 | 4 | 69,096 | 16 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 462 | 18 | 75,303 | 15 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 455 | 18 | 75,296 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 444 | 18 | 75,246 | 11 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 420 | 18 | 75,299 | 13 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 405 | 18 | 75,301 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 401 | 18 | 75,244 | 12 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 400 | 18 | 75,298 | 12 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 396 | 18 | 75,299 | 11 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 372 | 18 | 75,340 | 13 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 367 | 18 | 75,298 | 13 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 361 | 34 | 182,135 | 524 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 340 | 18 | 75,301 | 11 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 336 | 18 | 75,246 | 20 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 2 | 18 | 75,286 | 12 |


wall: 1305s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,194 | 881,576 | 140 | 03:47:46 | 03:50:07 |
| machine | 15 | 6,134 | 1,236,207 | 571 | 03:47:46 | 03:57:18 |
| ui | 1 | 16,955 | 2,889,527 | 390 | 03:48:01 | 03:54:31 |
| review | 3 | 10,124 | 9,562,232 | 334 | 03:48:01 | 03:53:35 |
| triage | 1 | 9,883 | 111,262 | 108 | 03:57:19 | 03:59:07 |
| refute | 1 | 5,215 | 2,233,968 | 289 | 03:59:08 | 04:03:58 |
| capture | 1 | 570 | 69,096 | 16 | 04:03:59 | 04:04:15 |
| synthesize | 1 | 30,342 | 198,813 | 315 | 04:04:16 | 04:09:31 |

- **claude-sonnet-5**: 6 agent · 69 calls · out 65,159 · in 138 · cache_read 6,384,242 · cache_create 579,752
- **claude-opus-5-5**: 3 agent · 76 calls · out 10,124 · in 152 · cache_read 9,562,232 · cache_create 406,500
- **claude-haiku-4-5-20251001**: 15 agent · 32 calls · out 6,134 · in 286 · cache_read 1,236,207 · cache_create 383,824

### S4 round 2 — wf_59ed9374-ac0 (15 agent, 41,717 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 23,083 | 4 | 89,281 | 232 |
| ui:E10 | claude-sonnet-5 | 30 | 8,526 | 60 | 3,407,613 | 312 |
| triage | claude-sonnet-5 | 2 | 3,025 | 4 | 71,008 | 41 |
| review:measurement | claude-opus-5-5 | 12 | 1,732 | 24 | 969,202 | 99 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 858 | 18 | 75,289 | 19 |
| review:bugs | claude-opus-5-5 | 10 | 710 | 20 | 806,048 | 66 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 591 | 34 | 152,885 | 282 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 565 | 18 | 75,318 | 19 |
| review:conventions | claude-opus-5-5 | 10 | 533 | 20 | 773,244 | 56 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 417 | 18 | 75,249 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 399 | 18 | 75,249 | 11 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 390 | 18 | 75,343 | 12 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 371 | 18 | 75,306 | 13 |
| capture:provenance | claude-sonnet-5 | 2 | 292 | 4 | 69,104 | 11 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 225 | 18 | 75,247 | 10 |


wall: 617s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 8 | 3,816 | 679,886 | 328 | 04:16:05 | 04:21:34 |
| ui | 1 | 8,526 | 3,407,613 | 312 | 04:16:05 | 04:21:18 |
| review | 3 | 2,975 | 2,548,494 | 103 | 04:16:05 | 04:17:48 |
| triage | 1 | 3,025 | 71,008 | 41 | 04:21:35 | 04:22:16 |
| capture | 1 | 292 | 69,104 | 11 | 04:22:17 | 04:22:28 |
| synthesize | 1 | 23,083 | 89,281 | 232 | 04:22:30 | 04:26:22 |

- **claude-sonnet-5**: 4 agent · 36 calls · out 34,926 · in 72 · cache_read 3,637,006 · cache_create 423,888
- **claude-opus-5-5**: 3 agent · 32 calls · out 2,975 · in 64 · cache_read 2,548,494 · cache_create 234,999
- **claude-haiku-4-5-20251001**: 8 agent · 18 calls · out 3,816 · in 160 · cache_read 679,886 · cache_create 239,765

### S4 round 3 — wf_ae4c397b-d98 (25 agent, 69,615 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 4 | 23,162 | 8 | 318,123 | 271 |
| triage | claude-sonnet-5 | 2 | 12,173 | 4 | 73,230 | 146 |
| ui:E10 | claude-sonnet-5 | 30 | 11,123 | 60 | 3,915,581 | 448 |
| ui:E15 | claude-sonnet-5 | 35 | 6,964 | 70 | 3,910,344 | 311 |
| baseline:diffBase | claude-sonnet-5 | 12 | 4,325 | 24 | 904,719 | 131 |
| review:measurement | claude-opus-5-5 | 9 | 1,574 | 18 | 766,710 | 85 |
| review:bugs | claude-opus-5-5 | 16 | 1,439 | 32 | 1,496,312 | 136 |
| review:conventions | claude-opus-5-5 | 8 | 1,068 | 16 | 608,768 | 62 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 715 | 18 | 75,952 | 16 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 668 | 18 | 75,981 | 18 |
| machine:bun _acceptance/hop-thoai-giu-cho-dang-n | claude-haiku-4-5-20251001 | 2 | 636 | 18 | 76,006 | 17 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 615 | 18 | 75,965 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 607 | 18 | 75,912 | 15 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 509 | 18 | 75,912 | 22 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 457 | 34 | 156,673 | 548 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 407 | 18 | 75,964 | 15 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 404 | 18 | 75,967 | 13 |
| capture:provenance | claude-sonnet-5 | 2 | 380 | 4 | 69,858 | 10 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 380 | 18 | 75,964 | 13 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 369 | 18 | 75,962 | 17 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 363 | 18 | 75,965 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 354 | 18 | 75,910 | 10 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 320 | 18 | 75,965 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 304 | 18 | 75,969 | 11 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 299 | 18 | 75,967 | 11 |


wall: 1031s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,325 | 904,719 | 131 | 06:02:45 | 06:04:56 |
| machine | 16 | 7,407 | 1,296,034 | 599 | 06:02:45 | 06:12:45 |
| ui | 2 | 18,087 | 7,825,925 | 448 | 06:03:01 | 06:10:29 |
| review | 3 | 4,081 | 2,871,790 | 139 | 06:03:03 | 06:05:22 |
| triage | 1 | 12,173 | 73,230 | 146 | 06:12:46 | 06:15:12 |
| capture | 1 | 380 | 69,858 | 10 | 06:15:13 | 06:15:24 |
| synthesize | 1 | 23,162 | 318,123 | 271 | 06:15:25 | 06:19:56 |

- **claude-sonnet-5**: 6 agent · 85 calls · out 58,127 · in 170 · cache_read 9,191,855 · cache_create 646,394
- **claude-opus-5-5**: 3 agent · 33 calls · out 4,081 · in 66 · cache_read 2,871,790 · cache_create 254,534
- **claude-haiku-4-5-20251001**: 16 agent · 34 calls · out 7,407 · in 304 · cache_read 1,296,034 · cache_create 444,915

