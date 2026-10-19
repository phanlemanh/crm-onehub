### S4 round 1 — wf_492e3e2c-7fd (27 agent, 36,552 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 10,114 | 6 | 140,111 | 67 |
| triage | claude-sonnet-5-5 | 2 | 3,719 | 4 | 46,891 | 30 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,148 | 4 | 45,604 | 33 |
| review:measurement | claude-opus-5-5 | 6 | 2,881 | 12 | 331,897 | 108 |
| ui:E9 | claude-sonnet-5-5 | 5 | 2,426 | 10 | 427,691 | 75 |
| review:bugs | claude-opus-5-5 | 21 | 1,537 | 42 | 1,576,404 | 216 |
| review:conventions | claude-opus-5-5 | 8 | 1,510 | 16 | 543,865 | 83 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,416 | 4 | 45,606 | 12 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,289 | 4 | 42,514 | 266 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 1,239 | 4 | 45,564 | 37 |
| judge:E11:operational-feasibility | claude-sonnet-5-5 | 2 | 1,103 | 4 | 45,994 | 15 |
| judge:E11:spec-alignment | claude-sonnet-5-5 | 2 | 1,084 | 4 | 45,992 | 16 |
| judge:E11:domain-correctness | claude-sonnet-5-5 | 2 | 1,082 | 4 | 42,526 | 17 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 437 | 4 | 2,973 | 390 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 415 | 4 | 49,764 | 63 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 397 | 4 | 45,533 | 14 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 397 | 4 | 45,533 | 13 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 308 | 4 | 45,631 | 280 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 279 | 4 | 45,661 | 72 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 278 | 4 | 45,607 | 11 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 259 | 4 | 45,666 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 230 | 4 | 45,612 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 224 | 4 | 45,592 | 15 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 45,600 | 8 |
| machine:bun _acceptance/thanh-ben-khu-dung-chung | claude-haiku-5-5 | 2 | 209 | 4 | 45,527 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 205 | 4 | 45,584 | 15 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 41,422 | 15 |


wall: 1187s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 415 | 49,764 | 63 | 12:00:57 | 12:02:00 |
| machine | 16 | 10,530 | 683,807 | 1069 | 12:00:57 | 12:18:45 |
| ui | 1 | 2,426 | 427,691 | 75 | 12:00:57 | 12:02:12 |
| judge | 3 | 3,269 | 134,512 | 23 | 12:01:13 | 12:01:36 |
| review | 3 | 5,928 | 2,452,166 | 218 | 12:01:16 | 12:04:54 |
| triage | 1 | 3,719 | 46,891 | 30 | 12:18:47 | 12:19:18 |
| capture | 1 | 151 | 41,422 | 15 | 12:19:19 | 12:19:34 |
| synthesize | 1 | 10,114 | 140,111 | 67 | 12:19:36 | 12:20:43 |

- **claude-sonnet-5-5**: 8 agent · 20 calls · out 20,094 · in 40 · cache_read 840,391 · cache_create 522,443
- **claude-haiku-5-5**: 16 agent · 32 calls · out 10,530 · in 64 · cache_read 683,807 · cache_create 773,203
- **claude-opus-5-5**: 3 agent · 35 calls · out 5,928 · in 70 · cache_read 2,452,166 · cache_create 280,918

### S4 round 2 — wf_d6a4adfc-676 (22 agent, 25,517 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 9,064 | 10 | 285,833 | 74 |
| ui:E9 | claude-sonnet-5-5 | 7 | 2,634 | 14 | 659,978 | 87 |
| review:bugs | claude-opus-5-5 | 11 | 1,471 | 22 | 667,194 | 99 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,336 | 4 | 45,792 | 13 |
| machine:EVAL=${EVAL:-} bun scripts/lan-do/tien-d | claude-haiku-5-5 | 2 | 1,267 | 4 | 45,606 | 33 |
| triage | claude-sonnet-5-5 | 3 | 1,190 | 6 | 98,917 | 18 |
| judge:E11:spec-alignment | claude-sonnet-5-5 | 2 | 1,134 | 4 | 42,568 | 14 |
| judge:E11:domain-correctness | claude-sonnet-5-5 | 2 | 1,109 | 4 | 42,568 | 18 |
| judge:E11:operational-feasibility | claude-sonnet-5-5 | 2 | 1,067 | 4 | 42,570 | 14 |
| review:conventions | claude-opus-5-5 | 4 | 967 | 8 | 148,543 | 37 |
| review:measurement | claude-opus-5-5 | 6 | 886 | 12 | 283,816 | 68 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 664 | 4 | 45,790 | 28 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 438 | 4 | 2,973 | 388 |
| machine:bun _acceptance/thanh-ben-khu-dung-chung | claude-haiku-5-5 | 2 | 329 | 4 | 45,569 | 8 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 307 | 4 | 45,847 | 72 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 306 | 4 | 45,817 | 283 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 296 | 4 | 45,529 | 278 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 230 | 4 | 45,654 | 8 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 229 | 4 | 46,549 | 33 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 226 | 4 | 45,626 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 219 | 4 | 45,786 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 41,608 | 15 |


wall: 1192s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 229 | 46,549 | 33 | 13:32:48 | 13:33:21 |
| machine | 11 | 5,618 | 459,989 | 1081 | 13:32:48 | 13:50:48 |
| ui | 1 | 2,634 | 659,978 | 87 | 13:32:48 | 13:34:15 |
| judge | 3 | 3,310 | 127,706 | 20 | 13:32:48 | 13:33:07 |
| review | 3 | 3,324 | 1,099,553 | 101 | 13:32:48 | 13:34:29 |
| triage | 1 | 1,190 | 98,917 | 18 | 13:50:50 | 13:51:08 |
| capture | 1 | 148 | 41,608 | 15 | 13:51:09 | 13:51:24 |
| synthesize | 1 | 9,064 | 285,833 | 74 | 13:51:26 | 13:52:40 |

- **claude-sonnet-5-5**: 8 agent · 25 calls · out 16,575 · in 50 · cache_read 1,260,591 · cache_create 535,527
- **claude-opus-5-5**: 3 agent · 21 calls · out 3,324 · in 42 · cache_read 1,099,553 · cache_create 194,036
- **claude-haiku-5-5**: 11 agent · 22 calls · out 5,618 · in 44 · cache_read 459,989 · cache_create 546,427

