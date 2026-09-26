### S4 round 1 — wf_571e3259-77d (30 agent, 156,844 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 34,095 | 4 | 120,345 | 378 |
| triage | claude-sonnet-5 | 2 | 23,460 | 4 | 99,614 | 290 |
| judge:E7:domain-correctness | claude-sonnet-5 | 2 | 21,119 | 4 | 91,343 | 219 |
| judge:E7:operational-feasibility | claude-sonnet-5 | 3 | 19,887 | 6 | 265,785 | 219 |
| judge:E7:spec-alignment | claude-sonnet-5 | 3 | 15,812 | 6 | 265,784 | 176 |
| ui:E8 | claude-sonnet-5 | 25 | 8,719 | 50 | 3,202,281 | 307 |
| ui:E15 | claude-sonnet-5 | 16 | 5,866 | 32 | 2,035,480 | 219 |
| ui:E11 | claude-sonnet-5 | 24 | 4,807 | 48 | 2,813,427 | 247 |
| review:measurement | claude-opus-5-5 | 23 | 4,591 | 46 | 3,455,415 | 352 |
| baseline:diffBase | claude-sonnet-5 | 37 | 3,214 | 74 | 4,193,274 | 326 |
| review:bugs | claude-opus-5-5 | 33 | 2,528 | 66 | 4,992,230 | 259 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 48 | 1,792 | 388 | 3,133,805 | 6934 |
| review:conventions | claude-opus-5-5 | 20 | 1,767 | 40 | 2,410,288 | 154 |
| refute:chieu-do.mjs | claude-sonnet-5 | 7 | 1,119 | 14 | 686,068 | 108 |
| machine:for t in apps/app/components/auth-shell. | claude-haiku-4-5-20251001 | 2 | 1,104 | 18 | 90,821 | 22 |
| machine:bash _acceptance/doi-ten-onehub-center/r | claude-haiku-4-5-20251001 | 2 | 883 | 18 | 90,725 | 54 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 2 | 750 | 18 | 90,724 | 19 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 3 | 634 | 26 | 159,190 | 25 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 602 | 18 | 90,710 | 16 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 572 | 18 | 90,710 | 30 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 459 | 18 | 90,755 | 14 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 440 | 18 | 90,821 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 401 | 18 | 90,757 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 361 | 18 | 90,708 | 13 |
| capture:provenance | claude-sonnet-5 | 3 | 347 | 6 | 215,641 | 23 |
| machine:cd packages/auth && TZ=Asia/Ho_Chi_Minh | claude-haiku-4-5-20251001 | 2 | 318 | 18 | 90,735 | 12 |
| machine:bun run test | claude-haiku-4-5-20251001 | 10 | 316 | 82 | 629,846 | 228 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 299 | 18 | 90,734 | 12 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 292 | 18 | 90,746 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 290 | 18 | 90,738 | 11 |


wall: 7741s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 3,214 | 4,193,274 | 326 | 11:38:39 | 11:44:05 |
| machine | 16 | 9,513 | 5,102,525 | 6936 | 11:38:39 | 13:34:14 |
| ui | 3 | 19,392 | 8,051,188 | 307 | 11:38:54 | 11:44:01 |
| judge | 3 | 56,818 | 622,912 | 221 | 11:38:57 | 11:42:37 |
| review | 3 | 8,886 | 10,857,933 | 375 | 11:39:13 | 11:45:28 |
| triage | 1 | 23,460 | 99,614 | 290 | 13:34:16 | 13:39:06 |
| refute | 1 | 1,119 | 686,068 | 108 | 13:39:08 | 13:40:56 |
| capture | 1 | 347 | 215,641 | 23 | 13:40:58 | 13:41:21 |
| synthesize | 1 | 34,095 | 120,345 | 378 | 13:41:22 | 13:47:40 |

- **claude-sonnet-5**: 11 agent · 124 calls · out 138,445 · in 248 · cache_read 13,989,042 · cache_create 1,415,509
- **claude-opus-5-5**: 3 agent · 76 calls · out 8,886 · in 152 · cache_read 10,857,933 · cache_create 478,278
- **claude-haiku-4-5-20251001**: 16 agent · 87 calls · out 9,513 · in 730 · cache_read 5,102,525 · cache_create 1,582,293

### S4 round 2 — wf_9159961e-700 (32 agent, 100,644 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| triage | claude-sonnet-5 | 2 | 15,895 | 4 | 96,103 | 194 |
| judge:E7:spec-alignment | claude-sonnet-5 | 2 | 14,436 | 4 | 127,491 | 148 |
| synthesize:report | claude-sonnet-5 | 6 | 14,054 | 12 | 705,388 | 462 |
| judge:E7:operational-feasibility | claude-sonnet-5 | 2 | 11,716 | 4 | 127,493 | 121 |
| ui:E8 | claude-sonnet-5 | 41 | 6,750 | 82 | 6,381,176 | 611 |
| ui:E11 | claude-sonnet-5 | 22 | 5,890 | 44 | 2,574,821 | 247 |
| baseline:diffBase | claude-sonnet-5 | 32 | 4,670 | 64 | 3,672,975 | 300 |
| judge:E7:domain-correctness | claude-sonnet-5 | 7 | 3,407 | 14 | 805,162 | 152 |
| ui:E15 | claude-sonnet-5 | 35 | 3,093 | 70 | 4,533,398 | 397 |
| refute:thuoc-da-ky.mjs | claude-sonnet-5 | 8 | 2,474 | 16 | 804,878 | 140 |
| review:measurement | claude-opus-5-5 | 17 | 2,265 | 34 | 2,034,316 | 181 |
| refute:thuoc-da-ky.mjs | claude-sonnet-5 | 8 | 1,949 | 16 | 832,624 | 126 |
| refute:thuoc-da-ky.mjs | claude-sonnet-5 | 6 | 1,897 | 12 | 598,931 | 116 |
| review:bugs | claude-opus-5-5 | 20 | 1,719 | 40 | 2,390,878 | 228 |
| machine:bash _acceptance/doi-ten-onehub-center/r | claude-haiku-4-5-20251001 | 2 | 1,165 | 18 | 90,734 | 56 |
| machine:bun run test | claude-haiku-4-5-20251001 | 4 | 968 | 34 | 204,893 | 227 |
| review:conventions | claude-opus-5-5 | 9 | 942 | 18 | 821,494 | 58 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 14 | 931 | 118 | 888,462 | 668 |
| machine:for t in apps/app/components/auth-shell. | claude-haiku-4-5-20251001 | 2 | 818 | 18 | 90,830 | 19 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 2 | 740 | 18 | 90,733 | 20 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 2 | 675 | 18 | 90,733 | 17 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 636 | 18 | 90,830 | 17 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 503 | 18 | 90,709 | 15 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 406 | 18 | 90,709 | 27 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 372 | 18 | 90,764 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 361 | 18 | 90,766 | 17 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 351 | 18 | 90,755 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 343 | 18 | 90,747 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 317 | 18 | 90,743 | 12 |
| capture:provenance | claude-sonnet-5 | 2 | 317 | 4 | 90,664 | 16 |
| machine:cd packages/auth && TZ=Asia/Ho_Chi_Minh | claude-haiku-4-5-20251001 | 2 | 316 | 18 | 90,744 | 12 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 268 | 18 | 90,707 | 11 |


wall: 1488s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 4,670 | 3,672,975 | 300 | 14:02:46 | 14:07:46 |
| machine | 16 | 9,170 | 2,363,859 | 669 | 14:02:46 | 14:13:56 |
| ui | 3 | 15,733 | 13,489,395 | 611 | 14:03:02 | 14:13:13 |
| judge | 3 | 29,559 | 1,060,146 | 152 | 14:03:07 | 14:05:39 |
| review | 3 | 4,926 | 5,246,688 | 231 | 14:03:20 | 14:07:11 |
| triage | 1 | 15,895 | 96,103 | 194 | 14:13:57 | 14:17:11 |
| refute | 3 | 6,320 | 2,236,433 | 140 | 14:17:13 | 14:19:33 |
| capture | 1 | 317 | 90,664 | 16 | 14:19:35 | 14:19:51 |
| synthesize | 1 | 14,054 | 705,388 | 462 | 14:19:53 | 14:27:34 |

- **claude-sonnet-5**: 13 agent · 173 calls · out 86,548 · in 346 · cache_read 21,351,104 · cache_create 1,650,937
- **claude-opus-5-5**: 3 agent · 46 calls · out 4,926 · in 92 · cache_read 5,246,688 · cache_create 334,454
- **claude-haiku-4-5-20251001**: 16 agent · 46 calls · out 9,170 · in 404 · cache_read 2,363,859 · cache_create 786,654

### S4 round 3 — wf_9d191fc7-726 (29 agent, 119,405 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 5 | 25,902 | 10 | 538,550 | 390 |
| judge:E7:domain-correctness | claude-sonnet-5 | 3 | 20,424 | 6 | 229,648 | 213 |
| judge:E7:spec-alignment | claude-sonnet-5 | 2 | 16,857 | 4 | 127,491 | 167 |
| judge:E7:operational-feasibility | claude-sonnet-5 | 2 | 12,705 | 4 | 127,493 | 127 |
| ui:E8 | claude-sonnet-5 | 18 | 11,002 | 36 | 2,375,404 | 331 |
| triage | claude-sonnet-5 | 2 | 8,133 | 4 | 95,440 | 99 |
| ui:E15 | claude-sonnet-5 | 22 | 5,851 | 44 | 2,526,145 | 196 |
| ui:E11 | claude-sonnet-5 | 35 | 4,444 | 70 | 4,895,359 | 353 |
| baseline:diffBase | claude-sonnet-5 | 23 | 2,400 | 46 | 2,373,003 | 172 |
| review:measurement | claude-opus-5-5 | 9 | 2,164 | 18 | 1,015,112 | 147 |
| review:bugs | claude-opus-5-5 | 16 | 2,066 | 32 | 1,811,296 | 159 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 2 | 921 | 18 | 90,733 | 22 |
| machine:for t in apps/app/components/auth-shell. | claude-haiku-4-5-20251001 | 2 | 870 | 18 | 90,830 | 18 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 2 | 683 | 18 | 90,736 | 19 |
| machine:bash _acceptance/doi-ten-onehub-center/r | claude-haiku-4-5-20251001 | 2 | 614 | 18 | 90,734 | 48 |
| machine:bun run test | claude-haiku-4-5-20251001 | 9 | 406 | 74 | 551,774 | 398 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 400 | 18 | 90,755 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 398 | 18 | 90,747 | 13 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 395 | 18 | 90,709 | 23 |
| machine:bun _acceptance/doi-ten-onehub-center/ra | claude-haiku-4-5-20251001 | 2 | 383 | 18 | 90,733 | 13 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 378 | 18 | 90,709 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 373 | 18 | 90,764 | 12 |
| machine:cd packages/auth && TZ=Asia/Ho_Chi_Minh | claude-haiku-4-5-20251001 | 2 | 339 | 18 | 90,744 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 319 | 18 | 90,766 | 13 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 316 | 18 | 90,707 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 266 | 18 | 90,743 | 12 |
| review:conventions | claude-opus-5-5 | 7 | 212 | 14 | 620,389 | 43 |
| capture:provenance | claude-sonnet-5 | 2 | 180 | 4 | 90,664 | 12 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-4-5-20251001 | 2 | 4 | 18 | 90,830 | 19 |


wall: 957s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,400 | 2,373,003 | 172 | 14:53:30 | 14:56:22 |
| machine | 16 | 7,065 | 1,913,014 | 451 | 14:53:30 | 15:01:01 |
| ui | 3 | 21,297 | 9,796,908 | 355 | 14:53:46 | 14:59:41 |
| judge | 3 | 49,986 | 484,632 | 213 | 14:53:48 | 14:57:21 |
| review | 3 | 4,442 | 3,446,797 | 163 | 14:53:56 | 14:56:39 |
| triage | 1 | 8,133 | 95,440 | 99 | 15:01:03 | 15:02:42 |
| capture | 1 | 180 | 90,664 | 12 | 15:02:43 | 15:02:55 |
| synthesize | 1 | 25,902 | 538,550 | 390 | 15:02:57 | 15:09:27 |

- **claude-sonnet-5**: 10 agent · 114 calls · out 107,898 · in 228 · cache_read 13,379,197 · cache_create 1,266,876
- **claude-opus-5-5**: 3 agent · 32 calls · out 4,442 · in 64 · cache_read 3,446,797 · cache_create 328,608
- **claude-haiku-4-5-20251001**: 16 agent · 39 calls · out 7,065 · in 344 · cache_read 1,913,014 · cache_create 710,354

