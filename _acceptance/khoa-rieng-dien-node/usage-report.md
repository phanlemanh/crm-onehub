### S4 round 1 — wf_6b42c4b3-6e5 (17 agent, 37,696 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 19,613 | 4 | 103,483 | 216 |
| triage | claude-sonnet-5 | 2 | 4,738 | 4 | 94,484 | 63 |
| refute:khong-hoi-quy.mjs | claude-sonnet-5 | 10 | 2,688 | 20 | 992,987 | 118 |
| review:measurement | claude-opus-5-5 | 12 | 1,982 | 24 | 1,337,523 | 180 |
| refute:khong-hoi-quy.mjs | claude-sonnet-5 | 7 | 1,491 | 14 | 606,696 | 71 |
| baseline:diffBase | claude-sonnet-5 | 9 | 1,082 | 18 | 839,233 | 75 |
| review:bugs | claude-opus-5-5 | 10 | 1,080 | 20 | 1,042,810 | 142 |
| machine:bun _acceptance/khoa-rieng-dien-node/ran | claude-haiku-4-5-20251001 | 14 | 874 | 114 | 868,691 | 1497 |
| review:conventions | claude-opus-5-5 | 8 | 859 | 16 | 789,659 | 68 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 675 | 18 | 89,877 | 29 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 421 | 18 | 89,875 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 394 | 18 | 89,943 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 393 | 18 | 89,940 | 15 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 380 | 18 | 89,877 | 13 |
| machine:bun run test | claude-haiku-4-5-20251001 | 7 | 370 | 58 | 445,187 | 244 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 332 | 18 | 89,940 | 25 |
| capture:provenance | claude-sonnet-5 | 2 | 324 | 4 | 90,069 | 19 |


wall: 1927s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 1,082 | 839,233 | 75 | 21:33:53 | 21:35:09 |
| machine | 8 | 3,839 | 1,853,330 | 1497 | 21:33:53 | 21:58:50 |
| review | 3 | 3,921 | 3,169,992 | 180 | 21:33:53 | 21:36:53 |
| triage | 1 | 4,738 | 94,484 | 63 | 21:58:55 | 21:59:58 |
| refute | 2 | 4,179 | 1,599,683 | 121 | 22:00:00 | 22:02:00 |
| capture | 1 | 324 | 90,069 | 19 | 22:02:03 | 22:02:22 |
| synthesize | 1 | 19,613 | 103,483 | 216 | 22:02:25 | 22:06:01 |

- **claude-sonnet-5**: 6 agent · 32 calls · out 29,936 · in 64 · cache_read 2,726,952 · cache_create 573,901
- **claude-opus-5-5**: 3 agent · 30 calls · out 3,921 · in 60 · cache_read 3,169,992 · cache_create 284,589
- **claude-haiku-4-5-20251001**: 8 agent · 33 calls · out 3,839 · in 280 · cache_read 1,853,330 · cache_create 498,681

### S4 round 2 — wf_7bea0c8d-5aa (13 agent, 34,230 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 10 | 24,307 | 20 | 1,048,718 | 293 |
| baseline:diffBase | claude-sonnet-5 | 13 | 2,937 | 26 | 1,259,357 | 282 |
| capture:provenance | claude-sonnet-5 | 2 | 1,528 | 4 | 90,153 | 21 |
| review:measurement | claude-opus-5-5 | 7 | 1,036 | 14 | 653,836 | 86 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 745 | 42 | 267,960 | 129 |
| review:conventions | claude-opus-5-5 | 5 | 716 | 10 | 392,747 | 38 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 663 | 18 | 89,923 | 16 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 591 | 18 | 89,923 | 36 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 455 | 18 | 89,989 | 20 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 419 | 18 | 89,986 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 343 | 18 | 89,986 | 18 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 303 | 18 | 89,921 | 13 |
| review:bugs | claude-opus-5-5 | 8 | 187 | 16 | 741,572 | 66 |


wall: 597s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 2,937 | 1,259,357 | 282 | 22:15:21 | 22:20:03 |
| machine | 7 | 3,519 | 807,688 | 199 | 22:15:21 | 22:18:40 |
| review | 3 | 1,939 | 1,788,155 | 88 | 22:15:21 | 22:16:49 |
| capture | 1 | 1,528 | 90,153 | 21 | 22:20:03 | 22:20:24 |
| synthesize | 1 | 24,307 | 1,048,718 | 293 | 22:20:24 | 22:25:17 |

- **claude-sonnet-5**: 3 agent · 25 calls · out 28,772 · in 50 · cache_read 2,398,228 · cache_create 383,972
- **claude-opus-5-5**: 3 agent · 20 calls · out 1,939 · in 40 · cache_read 1,788,155 · cache_create 266,183
- **claude-haiku-4-5-20251001**: 7 agent · 17 calls · out 3,519 · in 150 · cache_read 807,688 · cache_create 320,650

