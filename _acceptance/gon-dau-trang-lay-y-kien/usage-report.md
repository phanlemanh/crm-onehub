### S4 round 1 — wf_1951466d-44d (19 agent, 42,699 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 9,451 | 8 | 218,240 | 55 |
| review:measurement | claude-opus-5-5 | 6 | 3,887 | 12 | 345,697 | 106 |
| ui:E7 | claude-sonnet-5-5 | 9 | 3,638 | 18 | 930,748 | 306 |
| triage | claude-sonnet-5-5 | 2 | 3,566 | 4 | 50,616 | 25 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 3,390 | 4 | 49,257 | 167 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,300 | 4 | 49,401 | 33 |
| review:bugs | claude-opus-5-5 | 19 | 3,051 | 38 | 1,439,373 | 172 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 1,867 | 4 | 6,068 | 349 |
| machine:bun _acceptance/gon-dau-trang-lay-y-kien | claude-haiku-5-5 | 5 | 1,853 | 10 | 164,989 | 640 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,782 | 4 | 49,428 | 279 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,639 | 4 | 6,068 | 437 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,516 | 4 | 49,403 | 12 |
| review:conventions | claude-opus-5-5 | 9 | 1,351 | 18 | 482,721 | 61 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 849 | 4 | 49,397 | 11 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 546 | 4 | 3,034 | 353 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 312 | 4 | 49,458 | 73 |
| capture:provenance | claude-sonnet-5-5 | 2 | 251 | 4 | 45,158 | 7 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 229 | 4 | 50,110 | 32 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 221 | 4 | 49,280 | 10 |


wall: 1304s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 229 | 50,110 | 32 | 04:22:42 | 04:23:14 |
| machine | 11 | 17,275 | 525,783 | 1210 | 04:22:42 | 04:42:52 |
| ui | 1 | 3,638 | 930,748 | 306 | 04:22:42 | 04:27:48 |
| review | 3 | 8,289 | 2,267,791 | 173 | 04:22:42 | 04:25:35 |
| triage | 1 | 3,566 | 50,616 | 25 | 04:42:54 | 04:43:20 |
| capture | 1 | 251 | 45,158 | 7 | 04:43:22 | 04:43:29 |
| synthesize | 1 | 9,451 | 218,240 | 55 | 04:43:31 | 04:44:26 |

- **claude-sonnet-5-5**: 5 agent · 19 calls · out 17,135 · in 38 · cache_read 1,294,872 · cache_create 374,591
- **claude-opus-5-5**: 3 agent · 34 calls · out 8,289 · in 68 · cache_read 2,267,791 · cache_create 265,115
- **claude-haiku-5-5**: 11 agent · 25 calls · out 17,275 · in 50 · cache_read 525,783 · cache_create 734,292

### S4 round 2 — wf_c5b83953-50f (15 agent, 20,809 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 6,444 | 10 | 270,930 | 48 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 2,042 | 4 | 49,276 | 167 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,003 | 4 | 49,331 | 79 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,851 | 4 | 49,301 | 296 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,662 | 4 | 3,034 | 377 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,480 | 4 | 49,276 | 15 |
| machine:bun _acceptance/gon-dau-trang-lay-y-kien | claude-haiku-5-5 | 3 | 1,450 | 6 | 58,279 | 632 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,145 | 4 | 49,274 | 30 |
| review:bugs | claude-opus-5-5 | 13 | 499 | 26 | 884,522 | 99 |
| review:conventions | claude-opus-5-5 | 8 | 460 | 16 | 435,167 | 56 |
| review:measurement | claude-opus-5-5 | 10 | 438 | 20 | 663,326 | 77 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 436 | 4 | 6,068 | 442 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 405 | 4 | 49,270 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 342 | 4 | 49,301 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 152 | 4 | 45,031 | 8 |


wall: 1323s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 10 | 12,816 | 412,410 | 1263 | 05:18:24 | 05:39:27 |
| review | 3 | 1,397 | 1,983,015 | 102 | 05:18:24 | 05:20:06 |
| capture | 1 | 152 | 45,031 | 8 | 05:39:29 | 05:39:36 |
| synthesize | 1 | 6,444 | 270,930 | 48 | 05:39:38 | 05:40:26 |

- **claude-sonnet-5-5**: 2 agent · 7 calls · out 6,596 · in 14 · cache_read 315,961 · cache_create 124,036
- **claude-haiku-5-5**: 10 agent · 21 calls · out 12,816 · in 42 · cache_read 412,410 · cache_create 634,083
- **claude-opus-5-5**: 3 agent · 31 calls · out 1,397 · in 62 · cache_read 1,983,015 · cache_create 251,108

