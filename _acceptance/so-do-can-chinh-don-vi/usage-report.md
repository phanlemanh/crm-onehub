### S4 round 1 — wf_a508e62d-0ff (30 agent, 57,152 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 20,522 | 6 | 144,014 | 115 |
| triage | claude-sonnet-5-5 | 2 | 6,676 | 4 | 39,186 | 40 |
| review:measurement | claude-opus-5-5 | 12 | 4,000 | 24 | 775,829 | 197 |
| review:conventions | claude-opus-5-5 | 32 | 3,963 | 64 | 3,009,939 | 256 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 3,102 | 4 | 33,391 | 20 |
| ui:E12 | claude-sonnet-5-5 | 9 | 3,025 | 18 | 817,298 | 88 |
| review:bugs | claude-opus-5-5 | 31 | 2,038 | 62 | 3,221,591 | 323 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,851 | 4 | 33,365 | 18 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,761 | 4 | 33,349 | 301 |
| machine:bun _acceptance/so-do-can-chinh-don-vi/r | claude-haiku-5-5 | 14 | 1,583 | 28 | 466,652 | 1354 |
| machine:bun _acceptance/so-do-can-chinh-don-vi/r | claude-haiku-5-5 | 4 | 1,436 | 8 | 102,622 | 50 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,431 | 4 | 33,349 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 991 | 4 | 33,390 | 15 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 678 | 4 | 41,133 | 53 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 397 | 4 | 33,445 | 8 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 390 | 4 | 33,392 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 359 | 4 | 33,391 | 10 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 323 | 4 | 33,404 | 70 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 313 | 4 | 33,374 | 283 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 288 | 4 | 33,464 | 12 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 270 | 4 | 33,347 | 23 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 231 | 4 | 33,447 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 229 | 4 | 33,448 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 229 | 4 | 33,448 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 228 | 4 | 33,444 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 228 | 4 | 33,448 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 33,343 | 7 |
| machine:node _acceptance/so-do-can-chinh-don-vi/ | claude-haiku-5-5 | 2 | 214 | 4 | 33,385 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 29,274 | 6 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 30 | 4 | 33,445 | 10 |


wall: 1523s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 678 | 41,133 | 53 | 04:58:44 | 04:59:37 |
| machine | 22 | 16,099 | 1,237,343 | 1356 | 04:58:44 | 05:21:20 |
| ui | 1 | 3,025 | 817,298 | 88 | 04:58:56 | 05:00:24 |
| review | 3 | 10,001 | 7,007,359 | 324 | 04:58:57 | 05:04:21 |
| triage | 1 | 6,676 | 39,186 | 40 | 05:21:22 | 05:22:02 |
| capture | 1 | 151 | 29,274 | 6 | 05:22:04 | 05:22:10 |
| synthesize | 1 | 20,522 | 144,014 | 115 | 05:22:12 | 05:24:07 |

- **claude-sonnet-5-5**: 5 agent · 18 calls · out 31,052 · in 36 · cache_read 1,070,905 · cache_create 334,303
- **claude-opus-5-5**: 3 agent · 75 calls · out 10,001 · in 150 · cache_read 7,007,359 · cache_create 376,192
- **claude-haiku-5-5**: 22 agent · 58 calls · out 16,099 · in 116 · cache_read 1,237,343 · cache_create 743,205

### S4 round 2 — wf_1625f4e2-a61 (30 agent, 37,902 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 13,723 | 6 | 126,296 | 83 |
| triage | claude-sonnet-5-5 | 2 | 3,174 | 4 | 33,765 | 23 |
| ui:E12 | claude-sonnet-5-5 | 10 | 2,898 | 20 | 925,810 | 71 |
| review:measurement | claude-opus-5-5 | 17 | 1,886 | 34 | 896,303 | 114 |
| machine:bun _acceptance/so-do-can-chinh-don-vi/r | claude-haiku-5-5 | 18 | 1,756 | 36 | 666,575 | 1827 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,641 | 4 | 33,347 | 16 |
| review:bugs | claude-opus-5-5 | 19 | 1,570 | 38 | 1,185,924 | 133 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,460 | 4 | 30,480 | 313 |
| review:conventions | claude-opus-5-5 | 22 | 1,267 | 44 | 1,454,210 | 122 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,173 | 4 | 33,349 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,015 | 4 | 33,390 | 14 |
| machine:bun _acceptance/so-do-can-chinh-don-vi/r | claude-haiku-5-5 | 3 | 888 | 6 | 67,718 | 50 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 812 | 4 | 33,374 | 271 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 678 | 4 | 41,133 | 55 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 422 | 4 | 33,365 | 304 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 331 | 4 | 33,392 | 12 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 302 | 4 | 33,404 | 63 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 264 | 4 | 33,464 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 233 | 4 | 33,391 | 8 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 231 | 4 | 33,391 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 230 | 4 | 33,445 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 230 | 4 | 33,444 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 229 | 4 | 33,445 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 229 | 4 | 33,448 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 229 | 4 | 33,447 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 227 | 4 | 33,448 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 226 | 4 | 33,448 | 8 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 33,343 | 8 |
| machine:node _acceptance/so-do-can-chinh-don-vi/ | claude-haiku-5-5 | 2 | 215 | 4 | 33,385 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 29,274 | 6 |


wall: 1948s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 678 | 41,133 | 55 | 06:10:03 | 06:10:59 |
| machine | 22 | 12,558 | 1,399,493 | 1829 | 06:10:03 | 06:40:32 |
| ui | 1 | 2,898 | 925,810 | 71 | 06:10:15 | 06:11:27 |
| review | 3 | 4,723 | 3,536,437 | 135 | 06:10:15 | 06:12:30 |
| triage | 1 | 3,174 | 33,765 | 23 | 06:40:34 | 06:40:58 |
| capture | 1 | 148 | 29,274 | 6 | 06:41:00 | 06:41:06 |
| synthesize | 1 | 13,723 | 126,296 | 83 | 06:41:08 | 06:42:31 |

- **claude-sonnet-5-5**: 5 agent · 19 calls · out 20,621 · in 38 · cache_read 1,156,278 · cache_create 331,444
- **claude-opus-5-5**: 3 agent · 58 calls · out 4,723 · in 116 · cache_read 3,536,437 · cache_create 251,116
- **claude-haiku-5-5**: 22 agent · 61 calls · out 12,558 · in 122 · cache_read 1,399,493 · cache_create 746,073

