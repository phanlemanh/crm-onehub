### S4 round 1 — wf_da7d3c36-953 (34 agent, 64,366 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 18,476 | 6 | 142,669 | 106 |
| review:measurement | claude-opus-5-5 | 21 | 7,129 | 42 | 1,916,244 | 283 |
| triage | claude-sonnet-5-5 | 2 | 6,312 | 4 | 39,919 | 43 |
| ui:E12 | claude-sonnet-5-5 | 9 | 4,955 | 18 | 760,726 | 94 |
| judge:E10:operational-feasibility | claude-sonnet-5-5 | 3 | 4,179 | 6 | 85,848 | 33 |
| judge:E10:domain-correctness | claude-sonnet-5-5 | 3 | 4,114 | 6 | 82,482 | 31 |
| judge:E10:spec-alignment | claude-sonnet-5-5 | 2 | 3,325 | 4 | 34,740 | 29 |
| review:bugs | claude-opus-5-5 | 23 | 1,824 | 46 | 1,529,750 | 149 |
| review:conventions | claude-opus-5-5 | 26 | 1,622 | 52 | 2,032,938 | 141 |
| machine:for f in apps/app/components/tin-hieu/*. | claude-haiku-5-5 | 2 | 1,570 | 4 | 34,346 | 12 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,510 | 4 | 34,909 | 314 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,222 | 4 | 34,891 | 37 |
| machine:cd apps/app && bun test ./test/sua-giao- | claude-haiku-5-5 | 2 | 797 | 4 | 34,314 | 8 |
| refute:sua-giao-dien-tin-hieu.dom.tsx | claude-sonnet-5-5 | 4 | 726 | 8 | 105,356 | 16 |
| refute:config.yaml | claude-sonnet-5-5 | 5 | 684 | 10 | 141,461 | 21 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 585 | 4 | 34,364 | 12 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 580 | 4 | 42,150 | 62 |
| machine:node _acceptance/sua-giao-dien-tin-hieu/ | claude-haiku-5-5 | 2 | 495 | 4 | 34,223 | 7 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 450 | 4 | 34,893 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 419 | 4 | 34,289 | 11 |
| machine:cd apps/app && bun test ./test/ten-man.s | claude-haiku-5-5 | 2 | 355 | 4 | 34,296 | 9 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 302 | 4 | 34,918 | 287 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 300 | 4 | 34,948 | 63 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 299 | 4 | 31,316 | 223 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 294 | 4 | 34,285 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 283 | 4 | 34,285 | 10 |
| machine:cd apps/app && TZ=UTC bun test --timeout | claude-haiku-5-5 | 2 | 272 | 4 | 34,346 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 233 | 4 | 34,285 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 229 | 4 | 34,285 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 228 | 4 | 34,272 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 214 | 4 | 34,887 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 204 | 4 | 34,272 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 153 | 4 | 30,814 | 6 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 26 | 4 | 34,285 | 10 |


wall: 1127s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 580 | 42,150 | 62 | 04:11:47 | 04:12:48 |
| machine | 21 | 10,287 | 720,909 | 945 | 04:11:47 | 04:27:32 |
| ui | 1 | 4,955 | 760,726 | 94 | 04:11:58 | 04:13:32 |
| judge | 3 | 11,618 | 203,070 | 35 | 04:11:58 | 04:12:33 |
| review | 3 | 10,575 | 5,478,932 | 287 | 04:12:00 | 04:16:48 |
| triage | 1 | 6,312 | 39,919 | 43 | 04:27:33 | 04:28:16 |
| refute | 2 | 1,410 | 246,817 | 21 | 04:28:17 | 04:28:38 |
| capture | 1 | 153 | 30,814 | 6 | 04:28:39 | 04:28:45 |
| synthesize | 1 | 18,476 | 142,669 | 106 | 04:28:47 | 04:30:33 |

- **claude-sonnet-5-5**: 10 agent · 35 calls · out 43,504 · in 70 · cache_read 1,466,165 · cache_create 560,875
- **claude-opus-5-5**: 3 agent · 70 calls · out 10,575 · in 140 · cache_read 5,478,932 · cache_create 314,997
- **claude-haiku-5-5**: 21 agent · 42 calls · out 10,287 · in 84 · cache_read 720,909 · cache_create 678,808

### S4 round 2 — wf_a558bcc4-ac8 (27 agent, 46,160 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 12,348 | 6 | 125,549 | 83 |
| ui:E12 | claude-sonnet-5-5 | 10 | 4,359 | 20 | 849,777 | 101 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,569 | 4 | 35,405 | 31 |
| judge:E10:operational-feasibility | claude-sonnet-5-5 | 2 | 3,237 | 4 | 34,760 | 25 |
| judge:E10:domain-correctness | claude-sonnet-5-5 | 2 | 3,155 | 4 | 31,396 | 24 |
| judge:E10:spec-alignment | claude-sonnet-5-5 | 2 | 2,907 | 4 | 34,758 | 24 |
| triage | claude-sonnet-5-5 | 2 | 2,158 | 4 | 35,401 | 18 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,117 | 4 | 35,462 | 70 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,948 | 4 | 35,432 | 285 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,638 | 4 | 2,869 | 320 |
| review:bugs | claude-opus-5-5 | 13 | 1,516 | 26 | 614,768 | 82 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,340 | 4 | 35,407 | 9 |
| review:measurement | claude-opus-5-5 | 13 | 1,201 | 26 | 647,737 | 85 |
| review:conventions | claude-opus-5-5 | 8 | 1,082 | 16 | 311,276 | 52 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 696 | 4 | 34,382 | 12 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 368 | 4 | 34,303 | 8 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 339 | 4 | 34,303 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 296 | 4 | 34,203 | 230 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 288 | 4 | 34,307 | 11 |
| machine:cd apps/app && TZ=UTC bun test --timeout | claude-haiku-5-5 | 2 | 273 | 4 | 34,364 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 266 | 4 | 34,303 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 232 | 4 | 34,303 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 227 | 4 | 34,290 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 35,401 | 7 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 204 | 4 | 34,303 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 31,328 | 6 |
| machine:cd apps/app && bun test ./test/sua-giao- | claude-haiku-5-5 | 2 | 31 | 4 | 34,332 | 9 |


wall: 1078s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 17 | 14,047 | 557,369 | 964 | 05:34:27 | 05:50:32 |
| ui | 1 | 4,359 | 849,777 | 101 | 05:34:27 | 05:36:08 |
| judge | 3 | 9,299 | 100,914 | 27 | 05:34:38 | 05:35:05 |
| review | 3 | 3,799 | 1,573,781 | 86 | 05:34:39 | 05:36:05 |
| triage | 1 | 2,158 | 35,401 | 18 | 05:50:34 | 05:50:52 |
| capture | 1 | 150 | 31,328 | 6 | 05:50:54 | 05:51:00 |
| synthesize | 1 | 12,348 | 125,549 | 83 | 05:51:02 | 05:52:25 |

- **claude-sonnet-5-5**: 7 agent · 23 calls · out 28,314 · in 46 · cache_read 1,142,969 · cache_create 421,661
- **claude-haiku-5-5**: 17 agent · 34 calls · out 14,047 · in 68 · cache_read 557,369 · cache_create 586,469
- **claude-opus-5-5**: 3 agent · 34 calls · out 3,799 · in 68 · cache_read 1,573,781 · cache_create 176,855

