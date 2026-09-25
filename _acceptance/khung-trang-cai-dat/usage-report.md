### S4 round 1 — wf_c764c3b6-047 (28 agent, 341,709 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| ui:E11 | claude-sonnet-5 | 78 | 59,860 | 156 | 11,929,760 | 1505 |
| ui:E4 | claude-sonnet-5 | 80 | 55,525 | 160 | 13,813,788 | 1017 |
| ui:E13 | claude-sonnet-5 | 74 | 42,384 | 148 | 10,461,868 | 765 |
| ui:E6 | claude-sonnet-5 | 43 | 32,156 | 86 | 5,159,654 | 562 |
| synthesize:report | claude-sonnet-5 | 2 | 30,993 | 4 | 117,565 | 288 |
| ui:E8 | claude-sonnet-5 | 25 | 22,890 | 50 | 3,031,894 | 359 |
| review:measurement | claude-opus-5-5 | 16 | 19,646 | 32 | 1,942,924 | 230 |
| ui:E3 | claude-sonnet-5 | 32 | 17,900 | 64 | 4,298,310 | 384 |
| review:conventions | claude-opus-5-5 | 20 | 13,183 | 40 | 2,590,310 | 173 |
| review:bugs | claude-opus-5-5 | 27 | 12,011 | 54 | 3,506,394 | 176 |
| triage | claude-sonnet-5 | 2 | 10,975 | 4 | 89,964 | 105 |
| baseline:diffBase | claude-sonnet-5 | 21 | 10,118 | 42 | 1,939,369 | 146 |
| machine:node _acceptance/khung-trang-cai-dat/ran | claude-haiku-4-5-20251001 | 5 | 2,285 | 42 | 148,479 | 1094 |
| capture:provenance | claude-sonnet-5 | 3 | 1,342 | 6 | 191,987 | 21 |
| machine:bun run test | claude-haiku-4-5-20251001 | 2 | 1,258 | 18 | 56,859 | 76 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 898 | 18 | 81,777 | 15 |
| machine:cd apps/app && bun test test/khung-trang | claude-haiku-4-5-20251001 | 2 | 863 | 18 | 81,811 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 840 | 18 | 81,836 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 826 | 18 | 81,842 | 14 |
| machine:cd apps/app && bun test test/cai-dat-die | claude-haiku-4-5-20251001 | 2 | 777 | 18 | 81,814 | 12 |
| machine:node _acceptance/khung-trang-cai-dat/ran | claude-haiku-4-5-20251001 | 2 | 770 | 18 | 81,800 | 12 |
| machine:bun _acceptance/khung-trang-cai-dat/rang | claude-haiku-4-5-20251001 | 2 | 740 | 18 | 81,805 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 712 | 18 | 81,839 | 12 |
| machine:node _acceptance/khung-trang-cai-dat/ran | claude-haiku-4-5-20251001 | 2 | 710 | 18 | 81,802 | 12 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 658 | 18 | 81,777 | 23 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 563 | 18 | 81,775 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-4-5-20251001 | 2 | 431 | 18 | 81,843 | 12 |
| machine:cd apps/app && bun test test/khung-trang | claude-haiku-4-5-20251001 | 2 | 395 | 18 | 81,807 | 14 |


wall: 1939s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 10,118 | 1,939,369 | 146 | 03:18:56 | 03:21:22 |
| machine | 15 | 12,726 | 1,268,866 | 1096 | 03:18:56 | 03:37:12 |
| ui | 6 | 230,715 | 48,695,274 | 1507 | 03:19:10 | 03:44:17 |
| review | 3 | 44,840 | 8,039,628 | 243 | 03:19:12 | 03:23:15 |
| triage | 1 | 10,975 | 89,964 | 105 | 03:44:18 | 03:46:04 |
| capture | 1 | 1,342 | 191,987 | 21 | 03:46:05 | 03:46:26 |
| synthesize | 1 | 30,993 | 117,565 | 288 | 03:46:27 | 03:51:15 |

- **claude-sonnet-5**: 10 agent · 360 calls · out 284,143 · in 720 · cache_read 51,034,159 · cache_create 1,376,608
- **claude-opus-5-5**: 3 agent · 63 calls · out 44,840 · in 126 · cache_read 8,039,628 · cache_create 429,334
- **claude-haiku-4-5-20251001**: 15 agent · 33 calls · out 12,726 · in 294 · cache_read 1,268,866 · cache_create 713,151

