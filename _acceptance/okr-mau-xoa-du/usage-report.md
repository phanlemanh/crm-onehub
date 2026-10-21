### S4 round 1 — wf_7d94ffc6-bee (21 agent, 28,903 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 6,617 | 8 | 204,360 | 42 |
| triage | claude-sonnet-5-5 | 2 | 3,409 | 4 | 48,220 | 29 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,210 | 4 | 47,034 | 30 |
| machine:EVAL=E12,E15,E17 bun scripts/lan-do/tien | claude-haiku-5-5 | 2 | 2,690 | 4 | 47,110 | 109 |
| review:conventions | claude-opus-5-5 | 9 | 2,555 | 18 | 530,405 | 96 |
| review:bugs | claude-opus-5-5 | 10 | 2,171 | 20 | 660,937 | 132 |
| review:measurement | claude-opus-5-5 | 13 | 1,847 | 26 | 838,588 | 130 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,691 | 4 | 44,063 | 296 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,479 | 4 | 2,973 | 411 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 332 | 4 | 47,070 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 332 | 4 | 47,069 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 331 | 4 | 47,072 | 18 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 318 | 4 | 47,036 | 8 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 304 | 4 | 47,061 | 295 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 301 | 4 | 47,091 | 73 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 293 | 4 | 47,073 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 276 | 4 | 47,079 | 15 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 47,030 | 9 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 204 | 4 | 49,458 | 53 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 182 | 4 | 47,074 | 18 |
| capture:provenance | claude-sonnet-5-5 | 2 | 148 | 4 | 42,852 | 12 |


wall: 1219s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 204 | 49,458 | 53 | 14:43:30 | 14:44:23 |
| machine | 14 | 11,952 | 611,835 | 1131 | 14:43:30 | 15:02:22 |
| review | 3 | 6,573 | 2,029,930 | 133 | 14:43:30 | 14:45:44 |
| triage | 1 | 3,409 | 48,220 | 29 | 15:02:23 | 15:02:52 |
| capture | 1 | 148 | 42,852 | 12 | 15:02:54 | 15:03:06 |
| synthesize | 1 | 6,617 | 204,360 | 42 | 15:03:07 | 15:03:49 |

- **claude-sonnet-5-5**: 4 agent · 10 calls · out 10,378 · in 20 · cache_read 344,890 · cache_create 237,324
- **claude-haiku-5-5**: 14 agent · 28 calls · out 11,952 · in 56 · cache_read 611,835 · cache_create 730,438
- **claude-opus-5-5**: 3 agent · 32 calls · out 6,573 · in 64 · cache_read 2,029,930 · cache_create 252,809

### S4 round 3 — wf_87f1677a-d17 (20 agent, 28,533 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 8,264 | 10 | 275,729 | 72 |
| triage | claude-sonnet-5-5 | 2 | 3,947 | 4 | 49,242 | 32 |
| machine:EVAL=E12,E15,E17 bun scripts/lan-do/tien | claude-haiku-5-5 | 2 | 2,948 | 4 | 47,110 | 111 |
| review:conventions | claude-opus-5-5 | 9 | 2,053 | 18 | 527,792 | 119 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,868 | 4 | 47,091 | 75 |
| review:measurement | claude-opus-5-5 | 11 | 1,764 | 22 | 699,486 | 133 |
| review:bugs | claude-opus-5-5 | 12 | 1,762 | 24 | 847,833 | 178 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,175 | 4 | 47,036 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,042 | 4 | 47,079 | 18 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 495 | 4 | 47,074 | 21 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 437 | 4 | 2,973 | 391 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 404 | 4 | 47,034 | 24 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 397 | 4 | 47,072 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 352 | 4 | 47,069 | 17 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 331 | 4 | 47,073 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 331 | 4 | 47,070 | 19 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 307 | 4 | 47,061 | 280 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 44,063 | 274 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 213 | 4 | 47,030 | 10 |
| capture:provenance | claude-sonnet-5-5 | 2 | 145 | 4 | 42,852 | 10 |


wall: 1193s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 14 | 10,598 | 611,835 | 1074 | 15:54:12 | 16:12:06 |
| review | 3 | 5,579 | 2,075,111 | 184 | 15:54:12 | 15:57:15 |
| triage | 1 | 3,947 | 49,242 | 32 | 16:12:07 | 16:12:39 |
| capture | 1 | 145 | 42,852 | 10 | 16:12:40 | 16:12:50 |
| synthesize | 1 | 8,264 | 275,729 | 72 | 16:12:52 | 16:14:04 |

- **claude-sonnet-5-5**: 3 agent · 9 calls · out 12,356 · in 18 · cache_read 367,823 · cache_create 194,211
- **claude-haiku-5-5**: 14 agent · 28 calls · out 10,598 · in 56 · cache_read 611,835 · cache_create 730,121
- **claude-opus-5-5**: 3 agent · 32 calls · out 5,579 · in 64 · cache_read 2,075,111 · cache_create 259,148

