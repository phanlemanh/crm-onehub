### S4 round 1 — wf_b1f4bf22-e76 (28 agent, 48,422 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 12,621 | 6 | 119,919 | 80 |
| triage | claude-sonnet-5-5 | 2 | 4,861 | 4 | 38,234 | 39 |
| review:measurement | claude-opus-5-5 | 10 | 4,028 | 20 | 649,149 | 169 |
| ui:E7 | claude-sonnet-5-5 | 5 | 3,503 | 10 | 439,639 | 102 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,060 | 4 | 5,946 | 363 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,043 | 4 | 31,052 | 108 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 7 | 2,032 | 14 | 183,926 | 686 |
| review:bugs | claude-opus-5-5 | 20 | 1,922 | 40 | 1,294,572 | 168 |
| review:conventions | claude-opus-5-5 | 12 | 1,891 | 24 | 751,008 | 113 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 4 | 1,883 | 8 | 72,746 | 622 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,508 | 4 | 30,997 | 13 |
| refute:tep-theo-chu.spec.ts | claude-sonnet-5-5 | 3 | 1,201 | 6 | 62,598 | 32 |
| refute:do-man.mjs | claude-sonnet-5-5 | 6 | 1,201 | 12 | 173,687 | 42 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-5-5 | 2 | 1,083 | 4 | 30,477 | 22 |
| refute:tep-theo-chu.spec.ts | claude-sonnet-5-5 | 6 | 958 | 12 | 167,864 | 29 |
| refute:tep-theo-chu.dom.tsx | claude-sonnet-5-5 | 5 | 802 | 10 | 144,263 | 33 |
| refute:tep-theo-chu.dom.tsx | claude-sonnet-5-5 | 6 | 788 | 12 | 176,021 | 36 |
| refute:tep-theo-chu.spec.ts | claude-sonnet-5-5 | 3 | 680 | 6 | 60,589 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 670 | 4 | 30,481 | 22 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 591 | 4 | 30,479 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 513 | 4 | 30,478 | 22 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 344 | 4 | 32,924 | 44 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 310 | 4 | 30,478 | 20 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 30,991 | 9 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 198 | 4 | 30,481 | 20 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 184 | 4 | 30,536 | 13 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 181 | 4 | 30,995 | 165 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 29,646 | 15 |


wall: 2176s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 344 | 32,924 | 44 | 14:54:15 | 14:54:58 |
| machine | 14 | 13,471 | 600,063 | 1990 | 14:54:15 | 15:27:24 |
| ui | 1 | 3,503 | 439,639 | 102 | 14:54:15 | 14:55:57 |
| review | 3 | 7,841 | 2,694,729 | 172 | 14:54:15 | 14:57:07 |
| triage | 1 | 4,861 | 38,234 | 39 | 15:27:27 | 15:28:06 |
| refute | 6 | 5,630 | 785,022 | 44 | 15:28:08 | 15:28:52 |
| capture | 1 | 151 | 29,646 | 15 | 15:28:54 | 15:29:08 |
| synthesize | 1 | 12,621 | 119,919 | 80 | 15:29:11 | 15:30:31 |

- **claude-sonnet-5-5**: 11 agent · 43 calls · out 27,110 · in 86 · cache_read 1,445,384 · cache_create 509,367
- **claude-opus-5-5**: 3 agent · 42 calls · out 7,841 · in 84 · cache_read 2,694,729 · cache_create 285,219
- **claude-haiku-5-5**: 14 agent · 35 calls · out 13,471 · in 70 · cache_read 600,063 · cache_create 517,063

### S4 round 2 — wf_0cfbd5ca-419 (21 agent, 38,551 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 7 | 9,128 | 14 | 357,981 | 80 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,511 | 4 | 31,118 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 4,448 | 4 | 31,118 | 25 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,280 | 4 | 31,380 | 123 |
| ui:E7 | claude-sonnet-5-5 | 7 | 3,149 | 14 | 679,770 | 91 |
| triage | claude-sonnet-5-5 | 2 | 2,267 | 4 | 31,444 | 24 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,983 | 4 | 31,407 | 306 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,684 | 4 | 2,973 | 449 |
| review:measurement | claude-opus-5-5 | 15 | 1,520 | 30 | 728,280 | 127 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,508 | 4 | 31,382 | 12 |
| review:bugs | claude-opus-5-5 | 9 | 1,423 | 18 | 371,861 | 66 |
| machine:bun run test -- "cd packages/auth && bun | claude-haiku-5-5 | 2 | 1,269 | 4 | 31,114 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 571 | 4 | 31,116 | 14 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 403 | 4 | 31,437 | 78 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 378 | 4 | 31,173 | 9 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 2,973 | 333 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 223 | 4 | 31,115 | 13 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 193 | 4 | 31,376 | 8 |
| review:conventions | claude-opus-5-5 | 8 | 157 | 16 | 288,484 | 39 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 27,201 | 8 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 7 | 4 | 31,115 | 14 |


wall: 1437s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 14 | 20,756 | 380,797 | 1320 | 16:41:47 | 17:03:47 |
| ui | 1 | 3,149 | 679,770 | 91 | 16:41:47 | 16:43:18 |
| review | 3 | 3,100 | 1,388,625 | 129 | 16:41:47 | 16:43:56 |
| triage | 1 | 2,267 | 31,444 | 24 | 17:03:48 | 17:04:13 |
| capture | 1 | 151 | 27,201 | 8 | 17:04:15 | 17:04:23 |
| synthesize | 1 | 9,128 | 357,981 | 80 | 17:04:25 | 17:05:44 |

- **claude-sonnet-5-5**: 4 agent · 18 calls · out 14,695 · in 36 · cache_read 1,096,396 · cache_create 260,036
- **claude-haiku-5-5**: 14 agent · 28 calls · out 20,756 · in 56 · cache_read 380,797 · cache_create 498,968
- **claude-opus-5-5**: 3 agent · 32 calls · out 3,100 · in 64 · cache_read 1,388,625 · cache_create 168,733

