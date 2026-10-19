### S4 round 1 — wf_43fb2a4a-9dd (30 agent, 47,054 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 13,316 | 6 | 118,413 | 82 |
| ui:E11 | claude-sonnet-5-5 | 14 | 4,888 | 28 | 1,450,987 | 186 |
| triage | claude-sonnet-5-5 | 2 | 4,189 | 4 | 29,125 | 34 |
| review:measurement | claude-opus-5-5 | 22 | 3,695 | 44 | 1,696,238 | 191 |
| ui:E12 | claude-sonnet-5-5 | 8 | 2,320 | 16 | 753,356 | 134 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 4 | 2,318 | 8 | 99,041 | 31 |
| review:conventions | claude-opus-5-5 | 16 | 2,239 | 32 | 766,170 | 124 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 4 | 1,786 | 8 | 87,890 | 19 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,716 | 4 | 26,718 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,712 | 4 | 26,734 | 192 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 3 | 1,681 | 6 | 59,352 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,131 | 4 | 26,733 | 17 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 965 | 4 | 26,716 | 26 |
| review:bugs | claude-opus-5-5 | 35 | 617 | 70 | 2,335,658 | 212 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 556 | 4 | 26,725 | 16 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 487 | 4 | 31,136 | 45 |
| refute:dem-viec-rieng.ts | claude-sonnet-5-5 | 3 | 443 | 6 | 52,971 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 402 | 4 | 26,733 | 15 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 392 | 4 | 26,732 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 369 | 4 | 26,789 | 10 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 304 | 4 | 26,743 | 311 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 300 | 4 | 26,773 | 66 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 297 | 4 | 2,973 | 326 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 218 | 4 | 26,791 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 198 | 4 | 26,735 | 14 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 172 | 4 | 26,789 | 9 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 169 | 4 | 26,712 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 152 | 4 | 22,534 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 12 | 4 | 26,732 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 10 | 4 | 26,733 | 17 |


wall: 1103s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 487 | 31,136 | 45 | 11:24:54 | 11:25:39 |
| machine | 17 | 8,923 | 430,861 | 953 | 11:24:54 | 11:40:47 |
| ui | 2 | 7,208 | 2,204,343 | 186 | 11:24:54 | 11:28:00 |
| judge | 3 | 5,785 | 246,283 | 44 | 11:24:54 | 11:25:38 |
| review | 3 | 6,551 | 4,798,066 | 213 | 11:25:08 | 11:28:41 |
| triage | 1 | 4,189 | 29,125 | 34 | 11:40:49 | 11:41:23 |
| refute | 1 | 443 | 52,971 | 15 | 11:41:25 | 11:41:40 |
| capture | 1 | 152 | 22,534 | 9 | 11:41:42 | 11:41:52 |
| synthesize | 1 | 13,316 | 118,413 | 82 | 11:41:54 | 11:43:16 |

- **claude-sonnet-5-5**: 10 agent · 45 calls · out 31,580 · in 90 · cache_read 2,704,805 · cache_create 517,834
- **claude-opus-5-5**: 3 agent · 73 calls · out 6,551 · in 146 · cache_read 4,798,066 · cache_create 283,182
- **claude-haiku-5-5**: 17 agent · 34 calls · out 8,923 · in 68 · cache_read 430,861 · cache_create 465,619

### S4 round 2 — wf_c0cdd431-aed (21 agent, 40,604 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 12,371 | 6 | 114,246 | 84 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,499 | 4 | 27,451 | 31 |
| ui:E11 | claude-sonnet-5-5 | 7 | 3,248 | 14 | 618,230 | 136 |
| judge:E9:operational-feasibility | claude-sonnet-5-5 | 4 | 2,667 | 8 | 97,799 | 25 |
| judge:E9:spec-alignment | claude-sonnet-5-5 | 4 | 2,234 | 8 | 99,242 | 22 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,159 | 4 | 27,508 | 74 |
| machine:bun run test -- "cd packages/db && bun t | claude-haiku-5-5 | 2 | 1,934 | 4 | 26,709 | 18 |
| triage | claude-sonnet-5-5 | 2 | 1,886 | 4 | 26,466 | 17 |
| judge:E9:domain-correctness | claude-sonnet-5-5 | 5 | 1,865 | 10 | 129,652 | 22 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,639 | 4 | 27,453 | 12 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,592 | 4 | 2,973 | 415 |
| review:measurement | claude-opus-5-5 | 10 | 1,467 | 20 | 440,744 | 68 |
| review:bugs | claude-opus-5-5 | 13 | 925 | 26 | 500,719 | 59 |
| review:conventions | claude-opus-5-5 | 10 | 817 | 20 | 358,268 | 58 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 556 | 4 | 0 | 330 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 479 | 4 | 26,773 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 368 | 4 | 26,773 | 10 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 304 | 4 | 27,478 | 313 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 228 | 4 | 27,051 | 31 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 27,447 | 8 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 23,269 | 6 |


wall: 1309s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 228 | 27,051 | 31 | 11:53:44 | 11:54:15 |
| machine | 10 | 12,745 | 220,565 | 1195 | 11:53:44 | 12:13:39 |
| ui | 1 | 3,248 | 618,230 | 136 | 11:53:44 | 11:56:00 |
| judge | 3 | 6,766 | 326,693 | 27 | 11:53:44 | 11:54:11 |
| review | 3 | 3,209 | 1,299,731 | 69 | 11:53:44 | 11:54:53 |
| triage | 1 | 1,886 | 26,466 | 17 | 12:13:41 | 12:13:58 |
| capture | 1 | 151 | 23,269 | 6 | 12:14:00 | 12:14:06 |
| synthesize | 1 | 12,371 | 114,246 | 84 | 12:14:08 | 12:15:33 |

- **claude-sonnet-5-5**: 8 agent · 29 calls · out 24,650 · in 58 · cache_read 1,135,955 · cache_create 397,133
- **claude-haiku-5-5**: 10 agent · 20 calls · out 12,745 · in 40 · cache_read 220,565 · cache_create 317,817
- **claude-opus-5-5**: 3 agent · 33 calls · out 3,209 · in 66 · cache_read 1,299,731 · cache_create 156,171

