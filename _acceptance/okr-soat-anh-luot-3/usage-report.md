### S4 round 1 — wf_0e818ee1-eba (19 agent, 136,760 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| baseline:diffBase | claude-sonnet-5 | 39 | 38,167 | 78 | 3,739,063 | 593 |
| synthesize:report | claude-sonnet-5 | 2 | 23,740 | 4 | 87,073 | 206 |
| review:measurement | claude-opus-5-5 | 11 | 18,414 | 22 | 1,146,284 | 195 |
| review:bugs | claude-opus-5-5 | 23 | 15,053 | 46 | 2,502,069 | 177 |
| ui:E14 | claude-sonnet-5 | 20 | 11,347 | 40 | 1,814,377 | 184 |
| triage | claude-sonnet-5 | 2 | 7,832 | 4 | 72,298 | 83 |
| review:conventions | claude-opus-5-5 | 16 | 7,308 | 32 | 1,353,522 | 85 |
| machine:APP_URL=${APP_URL:-http://localhost:3630 | claude-haiku-4-5-20251001 | 2 | 3,304 | 18 | 74,473 | 185 |
| machine:bun run test | claude-haiku-4-5-20251001 | 3 | 3,061 | 26 | 100,616 | 165 |
| machine:bun _acceptance/okr-soat-anh-luot-3/rang | claude-haiku-4-5-20251001 | 2 | 1,327 | 18 | 74,428 | 17 |
| machine:bun _acceptance/okr-soat-anh-luot-3/rang | claude-haiku-4-5-20251001 | 2 | 1,273 | 18 | 74,426 | 17 |
| machine:node _acceptance/khung-trang-cai-dat/ran | claude-haiku-4-5-20251001 | 2 | 1,254 | 18 | 74,506 | 17 |
| machine:APP_URL=${APP_URL:-http://localhost:3630 | claude-haiku-4-5-20251001 | 2 | 1,202 | 18 | 74,476 | 59 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 739 | 18 | 74,394 | 22 |
| capture:provenance | claude-sonnet-5 | 2 | 720 | 4 | 67,658 | 9 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 710 | 18 | 74,394 | 11 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 657 | 18 | 74,392 | 11 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 379 | 18 | 74,437 | 13 |
| machine:cd apps/app && bun test test/okr-chu-ky- | claude-haiku-4-5-20251001 | 2 | 273 | 18 | 74,420 | 10 |


wall: 811s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 38,167 | 3,739,063 | 593 | 15:44:50 | 15:54:43 |
| machine | 11 | 14,179 | 844,962 | 212 | 15:44:50 | 15:48:22 |
| ui | 1 | 11,347 | 1,814,377 | 184 | 15:44:50 | 15:47:54 |
| review | 3 | 40,775 | 5,001,875 | 207 | 15:44:50 | 15:48:18 |
| triage | 1 | 7,832 | 72,298 | 83 | 15:48:23 | 15:49:46 |
| capture | 1 | 720 | 67,658 | 9 | 15:54:45 | 15:54:53 |
| synthesize | 1 | 23,740 | 87,073 | 206 | 15:54:55 | 15:58:21 |

- **claude-sonnet-5**: 5 agent · 65 calls · out 81,806 · in 130 · cache_read 5,780,469 · cache_create 497,965
- **claude-opus-5-5**: 3 agent · 50 calls · out 40,775 · in 100 · cache_read 5,001,875 · cache_create 322,040
- **claude-haiku-4-5-20251001**: 11 agent · 23 calls · out 14,179 · in 206 · cache_read 844,962 · cache_create 303,100

### S4 round 2 — wf_c301b7b1-0ab (18 agent, 97,563 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5 | 2 | 28,444 | 4 | 101,646 | 427 |
| review:measurement | claude-opus-5-5 | 12 | 15,147 | 24 | 1,227,735 | 165 |
| review:bugs | claude-opus-5-5 | 18 | 12,880 | 36 | 1,711,868 | 148 |
| ui:E14 | claude-sonnet-5 | 26 | 10,171 | 52 | 2,543,998 | 255 |
| review:conventions | claude-opus-5-5 | 16 | 8,957 | 32 | 1,344,894 | 97 |
| triage | claude-sonnet-5 | 2 | 7,943 | 4 | 72,065 | 97 |
| machine:node _acceptance/khung-trang-cai-dat/ran | claude-haiku-4-5-20251001 | 6 | 2,138 | 50 | 282,076 | 27 |
| machine:bun run test | claude-haiku-4-5-20251001 | 5 | 2,046 | 42 | 211,440 | 121 |
| machine:APP_URL=${APP_URL:-http://localhost:3630 | claude-haiku-4-5-20251001 | 2 | 1,670 | 18 | 74,513 | 63 |
| machine:bun _acceptance/okr-soat-anh-luot-3/rang | claude-haiku-4-5-20251001 | 2 | 1,410 | 18 | 74,465 | 17 |
| machine:cd packages/ui && TZ=Asia/Ho_Chi_Minh bu | claude-haiku-4-5-20251001 | 2 | 1,076 | 18 | 74,474 | 15 |
| machine:bun run lint:slop | claude-haiku-4-5-20251001 | 2 | 1,031 | 18 | 74,429 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-4-5-20251001 | 2 | 917 | 18 | 74,431 | 14 |
| machine:bun _acceptance/okr-soat-anh-luot-3/rang | claude-haiku-4-5-20251001 | 2 | 903 | 18 | 74,463 | 14 |
| capture:provenance | claude-sonnet-5 | 2 | 761 | 4 | 67,699 | 9 |
| machine:bunx turbo run build --force | claude-haiku-4-5-20251001 | 2 | 754 | 18 | 74,431 | 21 |
| machine:cd apps/app && bun test test/okr-chu-ky- | claude-haiku-4-5-20251001 | 2 | 723 | 18 | 74,457 | 11 |
| machine:APP_URL=${APP_URL:-http://localhost:3630 | claude-haiku-4-5-20251001 | 2 | 592 | 18 | 74,510 | 124 |


wall: 793s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 11 | 13,260 | 1,163,689 | 174 | 16:02:06 | 16:05:00 |
| ui | 1 | 10,171 | 2,543,998 | 255 | 16:02:06 | 16:06:21 |
| review | 3 | 36,984 | 4,284,497 | 166 | 16:02:06 | 16:04:52 |
| triage | 1 | 7,943 | 72,065 | 97 | 16:06:23 | 16:08:00 |
| capture | 1 | 761 | 67,699 | 9 | 16:08:01 | 16:08:10 |
| synthesize | 1 | 28,444 | 101,646 | 427 | 16:08:11 | 16:15:19 |

- **claude-sonnet-5**: 4 agent · 32 calls · out 47,319 · in 64 · cache_read 2,785,408 · cache_create 367,068
- **claude-opus-5-5**: 3 agent · 46 calls · out 36,984 · in 92 · cache_read 4,284,497 · cache_create 405,797
- **claude-haiku-4-5-20251001**: 11 agent · 29 calls · out 13,260 · in 254 · cache_read 1,163,689 · cache_create 307,826

