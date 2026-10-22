### S4 round 1 — wf_eb01bdc1-2a6 (27 agent, 64,551 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 17,375 | 8 | 257,154 | 105 |
| triage | claude-sonnet-5-5 | 2 | 8,808 | 4 | 53,379 | 58 |
| review:measurement | claude-opus-5-5 | 32 | 8,180 | 63 | 3,667,053 | 405 |
| machine:bun _acceptance/so-do-toan-vung/rang/giu | claude-haiku-5-5 | 103 | 5,212 | 206 | 11,797,069 | 10458 |
| ui:E10 | claude-sonnet-5-5 | 7 | 3,785 | 14 | 736,031 | 105 |
| review:conventions | claude-opus-5-5 | 28 | 3,359 | 56 | 2,511,757 | 257 |
| review:bugs | claude-opus-5-5 | 35 | 2,828 | 70 | 3,453,887 | 270 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,682 | 4 | 3,034 | 374 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,530 | 4 | 6,068 | 494 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,293 | 4 | 47,234 | 12 |
| refute:giu-ho-so.mjs | claude-sonnet-5-5 | 10 | 1,260 | 20 | 539,978 | 102 |
| refute:khung-trang-okr.tsx | claude-sonnet-5-5 | 9 | 1,253 | 17 | 442,279 | 65 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,080 | 4 | 47,232 | 40 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,010 | 4 | 47,374 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 748 | 4 | 47,334 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 657 | 4 | 47,358 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 644 | 4 | 47,331 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 630 | 4 | 47,331 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 516 | 4 | 47,334 | 12 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 486 | 4 | 52,177 | 52 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 436 | 4 | 47,350 | 15 |
| machine:cd apps/app && bun test ./test/so-do-toa | claude-haiku-5-5 | 2 | 432 | 4 | 47,278 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 357 | 4 | 47,335 | 12 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 315 | 4 | 47,259 | 305 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 301 | 4 | 47,289 | 82 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 218 | 4 | 47,228 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 156 | 4 | 42,991 | 14 |


wall: 10748s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 486 | 52,177 | 52 | 14:53:13 | 14:54:05 |
| machine | 17 | 17,061 | 12,468,438 | 10460 | 14:53:13 | 17:47:33 |
| ui | 1 | 3,785 | 736,031 | 105 | 14:53:26 | 14:55:12 |
| review | 3 | 14,367 | 9,632,697 | 406 | 14:53:28 | 15:00:14 |
| triage | 1 | 8,808 | 53,379 | 58 | 17:47:35 | 17:48:33 |
| refute | 2 | 2,513 | 982,257 | 106 | 17:48:34 | 17:50:20 |
| capture | 1 | 156 | 42,991 | 14 | 17:50:21 | 17:50:35 |
| synthesize | 1 | 17,375 | 257,154 | 105 | 17:50:36 | 17:52:21 |

- **claude-sonnet-5-5**: 7 agent · 36 calls · out 33,123 · in 71 · cache_read 2,123,989 · cache_create 546,465
- **claude-opus-5-5**: 3 agent · 95 calls · out 14,367 · in 189 · cache_read 9,632,697 · cache_create 428,655
- **claude-haiku-5-5**: 17 agent · 135 calls · out 17,061 · in 270 · cache_read 12,468,438 · cache_create 1,028,847

### S4 round 2 — wf_7ed3f0b2-e65 (26 agent, 59,259 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 12,318 | 4 | 70,419 | 66 |
| review:measurement | claude-opus-5-5 | 30 | 10,747 | 59 | 3,431,025 | 432 |
| triage | claude-sonnet-5-5 | 2 | 9,274 | 4 | 52,425 | 61 |
| ui:E10 | claude-sonnet-5-5 | 7 | 4,838 | 14 | 711,197 | 117 |
| machine:bun _acceptance/so-do-toan-vung/rang/giu | claude-haiku-5-5 | 143 | 3,745 | 286 | 20,257,152 | 14418 |
| review:conventions | claude-opus-5-5 | 18 | 2,359 | 36 | 1,414,510 | 205 |
| review:bugs | claude-opus-5-5 | 34 | 2,116 | 68 | 3,730,406 | 457 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,743 | 4 | 3,034 | 359 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,493 | 4 | 6,068 | 451 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,331 | 4 | 47,204 | 12 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,161 | 4 | 47,202 | 35 |
| refute:okr-so-do-toan-vung.dom.tsx | claude-sonnet-5-5 | 6 | 932 | 11 | 271,830 | 26 |
| refute:okr-so-do-toan-vung.dom.tsx | claude-sonnet-5-5 | 4 | 827 | 8 | 156,470 | 20 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 802 | 4 | 47,304 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 729 | 4 | 47,328 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 715 | 4 | 47,320 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 613 | 4 | 47,344 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 567 | 4 | 47,304 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 529 | 4 | 47,301 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 498 | 4 | 47,301 | 12 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 414 | 4 | 47,198 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 398 | 4 | 47,305 | 12 |
| machine:cd apps/app && bun test ./test/so-do-toa | claude-haiku-5-5 | 2 | 352 | 4 | 47,248 | 11 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 307 | 4 | 47,229 | 287 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 302 | 4 | 47,259 | 76 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 42,964 | 9 |


wall: 14589s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 17 | 15,699 | 20,928,101 | 14420 | 22:51:15 | 02:51:36 |
| ui | 1 | 4,838 | 711,197 | 118 | 22:51:15 | 22:53:13 |
| review | 3 | 15,222 | 8,575,941 | 463 | 22:51:30 | 22:59:13 |
| triage | 1 | 9,274 | 52,425 | 61 | 02:51:38 | 02:52:39 |
| refute | 2 | 1,759 | 428,300 | 26 | 02:52:40 | 02:53:06 |
| capture | 1 | 149 | 42,964 | 9 | 02:53:07 | 02:53:16 |
| synthesize | 1 | 12,318 | 70,419 | 66 | 02:53:18 | 02:54:24 |

- **claude-sonnet-5-5**: 6 agent · 23 calls · out 28,338 · in 45 · cache_read 1,305,305 · cache_create 454,542
- **claude-opus-5-5**: 3 agent · 82 calls · out 15,222 · in 163 · cache_read 8,575,941 · cache_create 442,200
- **claude-haiku-5-5**: 17 agent · 175 calls · out 15,699 · in 350 · cache_read 20,928,101 · cache_create 1,073,919

### S4 round 3 — wf_fc1f2402-672 (25 agent, 60,573 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 16,563 | 6 | 166,659 | 102 |
| review:measurement | claude-opus-5-5 | 24 | 9,736 | 47 | 2,759,473 | 333 |
| triage | claude-sonnet-5-5 | 2 | 7,344 | 4 | 52,975 | 49 |
| machine:bun test _acceptance/so-do-toan-vung/ran | claude-haiku-5-5 | 120 | 5,650 | 240 | 15,177,817 | 12135 |
| ui:E10 | claude-sonnet-5-5 | 10 | 4,229 | 20 | 1,122,575 | 171 |
| review:bugs | claude-opus-5-5 | 31 | 2,569 | 61 | 3,280,158 | 310 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,942 | 4 | 47,223 | 299 |
| review:conventions | claude-opus-5-5 | 23 | 1,867 | 46 | 1,895,755 | 219 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,824 | 4 | 3,034 | 328 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,566 | 4 | 6,068 | 463 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,465 | 4 | 47,198 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 662 | 4 | 47,314 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 616 | 4 | 47,298 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 596 | 4 | 47,295 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 596 | 4 | 47,299 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 566 | 4 | 47,295 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 563 | 4 | 47,298 | 14 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 487 | 4 | 52,289 | 51 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 440 | 4 | 47,338 | 12 |
| machine:cd apps/app && bun test ./test/so-do-toa | claude-haiku-5-5 | 2 | 405 | 4 | 47,242 | 11 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 306 | 4 | 47,253 | 76 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 218 | 4 | 47,192 | 9 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 202 | 4 | 47,196 | 40 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 42,955 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 11 | 4 | 47,322 | 13 |


wall: 12302s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 487 | 52,289 | 51 | 06:59:47 | 07:00:38 |
| machine | 17 | 17,628 | 15,848,682 | 12137 | 06:59:47 | 10:22:04 |
| ui | 1 | 4,229 | 1,122,575 | 171 | 07:00:04 | 07:02:55 |
| review | 3 | 14,172 | 7,935,386 | 338 | 07:00:04 | 07:05:42 |
| triage | 1 | 7,344 | 52,975 | 49 | 10:22:06 | 10:22:55 |
| capture | 1 | 150 | 42,955 | 9 | 10:22:56 | 10:23:06 |
| synthesize | 1 | 16,563 | 166,659 | 102 | 10:23:07 | 10:24:49 |

- **claude-sonnet-5-5**: 5 agent · 19 calls · out 28,773 · in 38 · cache_read 1,437,453 · cache_create 410,506
- **claude-opus-5-5**: 3 agent · 78 calls · out 14,172 · in 154 · cache_read 7,935,386 · cache_create 410,902
- **claude-haiku-5-5**: 17 agent · 152 calls · out 17,628 · in 304 · cache_read 15,848,682 · cache_create 1,048,751

