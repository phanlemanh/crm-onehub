### S4 round 1 — wf_18a5b7d9-bcc (31 agent, 62,988 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 15,857 | 8 | 436,256 | 140 |
| review:measurement | claude-opus-5-5 | 19 | 7,833 | 38 | 2,882,989 | 275 |
| triage | claude-sonnet-5-5 | 2 | 7,430 | 4 | 108,646 | 54 |
| ui:E14 | claude-sonnet-5-5 | 6 | 3,179 | 12 | 551,441 | 70 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,826 | 4 | 133,977 | 15 |
| review:bugs | claude-opus-5-5 | 33 | 2,688 | 66 | 5,090,057 | 287 |
| review:conventions | claude-opus-5-5 | 36 | 2,544 | 72 | 5,771,546 | 254 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,836 | 4 | 134,032 | 71 |
| judge:E13:spec-alignment | claude-sonnet-5-5 | 3 | 1,816 | 6 | 245,883 | 17 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,761 | 4 | 98,372 | 297 |
| judge:E13:domain-correctness | claude-sonnet-5-5 | 3 | 1,598 | 6 | 210,967 | 18 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,579 | 4 | 134,002 | 251 |
| machine:for f in apps/app/components/thong-bao/* | claude-haiku-5-5 | 2 | 1,343 | 4 | 133,511 | 12 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,255 | 4 | 133,993 | 303 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 1,207 | 4 | 133,420 | 17 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,127 | 4 | 133,975 | 37 |
| refute:thong-bao-ghi.ts | claude-sonnet-5-5 | 5 | 1,088 | 10 | 455,151 | 23 |
| refute:thong-bao-doi-chieu.ts | claude-sonnet-5-5 | 7 | 906 | 14 | 639,509 | 29 |
| machine:bun run test -- "cd apps/api && TZ=Asia/ | claude-haiku-5-5 | 2 | 793 | 4 | 133,420 | 29 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 765 | 4 | 133,415 | 14 |
| judge:E13:operational-feasibility | claude-sonnet-5-5 | 4 | 601 | 8 | 349,542 | 18 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 509 | 4 | 107,167 | 51 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 454 | 4 | 133,437 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 385 | 4 | 133,418 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 359 | 4 | 133,631 | 15 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 357 | 4 | 133,419 | 16 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 201 | 4 | 133,441 | 10 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 190 | 4 | 133,481 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 181 | 4 | 133,440 | 13 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 168 | 4 | 133,971 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 152 | 4 | 97,782 | 7 |


wall: 1240s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 509 | 107,167 | 51 | 06:39:06 | 06:39:57 |
| machine | 18 | 16,787 | 2,370,355 | 999 | 06:39:06 | 06:55:45 |
| ui | 1 | 3,179 | 551,441 | 70 | 06:39:25 | 06:40:36 |
| judge | 3 | 4,015 | 806,392 | 21 | 06:39:25 | 06:39:47 |
| review | 3 | 13,065 | 13,744,592 | 288 | 06:39:28 | 06:44:16 |
| triage | 1 | 7,430 | 108,646 | 54 | 06:55:48 | 06:56:42 |
| refute | 2 | 1,994 | 1,094,660 | 29 | 06:56:44 | 06:57:13 |
| capture | 1 | 152 | 97,782 | 7 | 06:57:16 | 06:57:23 |
| synthesize | 1 | 15,857 | 436,256 | 140 | 06:57:26 | 06:59:46 |

- **claude-sonnet-5-5**: 10 agent · 38 calls · out 33,136 · in 76 · cache_read 3,202,344 · cache_create 1,090,197
- **claude-opus-5-5**: 3 agent · 88 calls · out 13,065 · in 176 · cache_read 13,744,592 · cache_create 523,584
- **claude-haiku-5-5**: 18 agent · 36 calls · out 16,787 · in 72 · cache_read 2,370,355 · cache_create 1,310,920

### S4 round 2 — wf_5dba186f-141 (24 agent, 31,007 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 8,435 | 6 | 270,738 | 85 |
| triage | claude-sonnet-5-5 | 2 | 2,109 | 4 | 100,650 | 22 |
| review:measurement | claude-opus-5-5 | 9 | 2,105 | 18 | 988,810 | 80 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,727 | 4 | 34,982 | 341 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,679 | 4 | 133,377 | 30 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,617 | 4 | 133,434 | 70 |
| judge:E13:domain-correctness | claude-sonnet-5-5 | 3 | 1,589 | 6 | 211,061 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,490 | 4 | 133,395 | 305 |
| judge:E13:operational-feasibility | claude-sonnet-5-5 | 4 | 1,223 | 8 | 360,954 | 19 |
| review:conventions | claude-opus-5-5 | 9 | 1,094 | 18 | 953,360 | 55 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 1,060 | 4 | 133,445 | 14 |
| review:bugs | claude-opus-5-5 | 6 | 1,023 | 12 | 610,690 | 40 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 988 | 4 | 133,462 | 16 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 890 | 4 | 133,506 | 19 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 770 | 4 | 133,440 | 15 |
| judge:E13:spec-alignment | claude-sonnet-5-5 | 4 | 580 | 8 | 360,098 | 18 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 398 | 4 | 133,373 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 395 | 4 | 133,466 | 14 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 371 | 4 | 104,324 | 39 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 363 | 4 | 133,443 | 11 |
| machine:bun run test -- "cd apps/agent && TZ=Asi | claude-haiku-5-5 | 2 | 351 | 4 | 133,444 | 12 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 303 | 4 | 133,404 | 247 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 98,397 | 218 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 97,184 | 7 |


wall: 1351s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 371 | 104,324 | 39 | 07:03:01 | 07:03:41 |
| machine | 14 | 12,329 | 1,734,568 | 1233 | 07:03:01 | 07:23:35 |
| judge | 3 | 3,392 | 932,113 | 23 | 07:03:02 | 07:03:24 |
| review | 3 | 4,222 | 2,552,860 | 82 | 07:03:17 | 07:04:40 |
| triage | 1 | 2,109 | 100,650 | 22 | 07:23:36 | 07:23:58 |
| capture | 1 | 149 | 97,184 | 7 | 07:23:59 | 07:24:06 |
| synthesize | 1 | 8,435 | 270,738 | 85 | 07:24:08 | 07:25:32 |

- **claude-sonnet-5-5**: 7 agent · 20 calls · out 14,456 · in 40 · cache_read 1,505,009 · cache_create 758,349
- **claude-opus-5-5**: 3 agent · 24 calls · out 4,222 · in 48 · cache_read 2,552,860 · cache_create 321,804
- **claude-haiku-5-5**: 14 agent · 28 calls · out 12,329 · in 56 · cache_read 1,734,568 · cache_create 1,123,959

