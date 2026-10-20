### S4 round 1 — wf_741f9180-7d4 (27 agent, 49,323 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 14,758 | 8 | 244,774 | 86 |
| triage | claude-sonnet-5-5 | 2 | 5,655 | 4 | 50,671 | 43 |
| ui:E12 | claude-sonnet-5-5 | 6 | 5,653 | 12 | 537,357 | 109 |
| review:measurement | claude-opus-5-5 | 21 | 3,737 | 42 | 2,377,725 | 285 |
| machine:bun test _acceptance/ngan-kr-mot-cho/ran | claude-haiku-5-5 | 61 | 3,068 | 122 | 5,207,858 | 6027 |
| review:conventions | claude-opus-5-5 | 12 | 2,396 | 24 | 859,818 | 125 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,184 | 4 | 47,358 | 83 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,775 | 4 | 47,328 | 297 |
| review:bugs | claude-opus-5-5 | 35 | 1,579 | 70 | 3,856,730 | 387 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,526 | 4 | 47,319 | 282 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,416 | 4 | 47,303 | 12 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,216 | 4 | 2,973 | 344 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 725 | 4 | 47,229 | 22 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 578 | 4 | 53,589 | 58 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 337 | 4 | 47,112 | 12 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 296 | 4 | 47,301 | 25 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 291 | 4 | 47,131 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 287 | 4 | 47,160 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 265 | 4 | 47,112 | 13 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 47,297 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 206 | 4 | 47,056 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 203 | 4 | 47,113 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 203 | 4 | 47,109 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 202 | 4 | 47,112 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 198 | 4 | 47,112 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 182 | 4 | 47,117 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 174 | 4 | 43,121 | 7 |


wall: 6184s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 578 | 53,589 | 58 | 10:40:01 | 10:40:59 |
| machine | 19 | 14,793 | 6,013,100 | 6043 | 10:40:01 | 12:20:44 |
| ui | 1 | 5,653 | 537,357 | 109 | 10:40:17 | 10:42:06 |
| review | 3 | 7,712 | 7,094,273 | 392 | 10:40:17 | 10:46:49 |
| triage | 1 | 5,655 | 50,671 | 43 | 12:20:46 | 12:21:29 |
| capture | 1 | 174 | 43,121 | 7 | 12:21:30 | 12:21:38 |
| synthesize | 1 | 14,758 | 244,774 | 86 | 12:21:39 | 12:23:05 |

- **claude-sonnet-5-5**: 5 agent · 16 calls · out 26,818 · in 32 · cache_read 929,512 · cache_create 393,769
- **claude-opus-5-5**: 3 agent · 68 calls · out 7,712 · in 136 · cache_read 7,094,273 · cache_create 404,205
- **claude-haiku-5-5**: 19 agent · 97 calls · out 14,793 · in 194 · cache_read 6,013,100 · cache_create 1,024,831

### S4 round 2 — wf_5b8b09e8-c87 (13 agent, 20,983 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,861 | 8 | 221,006 | 66 |
| review:conventions | claude-opus-5-5 | 6 | 2,601 | 12 | 278,328 | 47 |
| triage | claude-sonnet-5-5 | 3 | 2,522 | 6 | 104,348 | 20 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,006 | 4 | 47,048 | 77 |
| review:bugs | claude-opus-5-5 | 21 | 1,664 | 42 | 1,570,885 | 115 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,470 | 4 | 46,993 | 12 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 437 | 4 | 2,973 | 403 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 307 | 4 | 47,018 | 298 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 46,993 | 269 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 295 | 4 | 46,991 | 24 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 46,987 | 15 |
| review:measurement | claude-opus-5-5 | 6 | 161 | 12 | 260,781 | 30 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 42,811 | 11 |


wall: 1207s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 7 | 5,026 | 285,003 | 1105 | 12:25:27 | 12:43:52 |
| review | 3 | 4,426 | 2,109,994 | 118 | 12:25:27 | 12:27:25 |
| triage | 1 | 2,522 | 104,348 | 20 | 12:43:54 | 12:44:14 |
| capture | 1 | 148 | 42,811 | 11 | 12:44:15 | 12:44:26 |
| synthesize | 1 | 8,861 | 221,006 | 66 | 12:44:27 | 12:45:34 |

- **claude-sonnet-5-5**: 3 agent · 9 calls · out 11,531 · in 18 · cache_read 368,165 · cache_create 189,682
- **claude-opus-5-5**: 3 agent · 33 calls · out 4,426 · in 66 · cache_read 2,109,994 · cache_create 216,416
- **claude-haiku-5-5**: 7 agent · 14 calls · out 5,026 · in 28 · cache_read 285,003 · cache_create 378,637

