### S4 round 1 — wf_2145650e-59e (29 agent, 48,049 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 14,571 | 6 | 131,347 | 98 |
| triage | claude-sonnet-5-5 | 2 | 4,942 | 4 | 43,052 | 35 |
| review:measurement | claude-opus-5-5 | 16 | 4,906 | 32 | 1,316,813 | 245 |
| review:conventions | claude-opus-5-5 | 30 | 2,842 | 60 | 2,432,595 | 237 |
| review:bugs | claude-opus-5-5 | 28 | 2,719 | 56 | 2,389,870 | 248 |
| ui:E7 | claude-sonnet-5-5 | 6 | 2,037 | 12 | 493,761 | 151 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,907 | 4 | 39,036 | 55 |
| refute:do-bao-doi-cho.ts | claude-sonnet-5-5 | 4 | 1,724 | 8 | 118,894 | 25 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 1,570 | 4 | 39,074 | 16 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,454 | 4 | 39,020 | 11 |
| refute:do-bao-doi-cho.spec.ts | claude-sonnet-5-5 | 4 | 1,295 | 8 | 120,880 | 34 |
| refute:tin-hieu-nguon.spec.ts | claude-sonnet-5-5 | 8 | 1,026 | 16 | 310,471 | 45 |
| machine:bun run test -- "bun test scripts/tin-hi | claude-haiku-5-5 | 2 | 863 | 4 | 39,041 | 14 |
| refute:do-bao-doi-cho.spec.ts | claude-sonnet-5-5 | 4 | 832 | 8 | 126,465 | 22 |
| refute:tin-hieu-nguon.spec.ts | claude-sonnet-5-5 | 3 | 776 | 6 | 79,450 | 20 |
| refute:do-man.mjs | claude-sonnet-5-5 | 3 | 705 | 6 | 79,087 | 19 |
| refute:do-man.mjs | claude-sonnet-5-5 | 4 | 696 | 8 | 119,287 | 25 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 529 | 4 | 39,018 | 28 |
| machine:bun run test -- "cd apps/app && bun test | claude-haiku-5-5 | 2 | 327 | 4 | 39,044 | 11 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 308 | 4 | 41,484 | 47 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 303 | 4 | 39,075 | 72 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 301 | 4 | 3,057 | 315 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 298 | 4 | 35,940 | 281 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 259 | 4 | 39,077 | 12 |
| machine:bun run test -- "cd apps/api && CRM_TELE | claude-haiku-5-5 | 2 | 248 | 4 | 39,077 | 12 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 219 | 4 | 39,014 | 7 |
| machine:cd apps/app && bun test ./test/thong-bao | claude-haiku-5-5 | 2 | 213 | 4 | 39,022 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 34,750 | 9 |
| machine:cd apps/app && bun test ./test/tin-hieu- | claude-haiku-5-5 | 2 | 28 | 4 | 39,037 | 7 |


wall: 984s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 308 | 41,484 | 47 | 06:06:37 | 06:07:24 |
| machine | 14 | 8,519 | 507,532 | 785 | 06:06:37 | 06:19:42 |
| ui | 1 | 2,037 | 493,761 | 151 | 06:06:37 | 06:09:08 |
| review | 3 | 10,467 | 6,139,278 | 257 | 06:06:37 | 06:10:54 |
| triage | 1 | 4,942 | 43,052 | 36 | 06:19:44 | 06:20:20 |
| refute | 7 | 7,054 | 954,534 | 47 | 06:20:22 | 06:21:10 |
| capture | 1 | 151 | 34,750 | 9 | 06:21:12 | 06:21:21 |
| synthesize | 1 | 14,571 | 131,347 | 98 | 06:21:23 | 06:23:01 |

- **claude-sonnet-5-5**: 12 agent · 45 calls · out 29,063 · in 90 · cache_read 1,698,928 · cache_create 630,579
- **claude-opus-5-5**: 3 agent · 74 calls · out 10,467 · in 148 · cache_read 6,139,278 · cache_create 360,658
- **claude-haiku-5-5**: 14 agent · 28 calls · out 8,519 · in 56 · cache_read 507,532 · cache_create 556,782

### S4 round 2 — wf_387c0195-d4a (19 agent, 30,168 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 9,397 | 6 | 121,643 | 67 |
| review:measurement | claude-opus-5-5 | 15 | 4,475 | 30 | 1,009,837 | 150 |
| ui:E7 | claude-sonnet-5-5 | 7 | 3,860 | 14 | 604,245 | 139 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,120 | 4 | 39,572 | 76 |
| triage | claude-sonnet-5-5 | 2 | 1,705 | 4 | 38,903 | 15 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,572 | 4 | 3,057 | 349 |
| refute:do-bao-doi-cho.ts | claude-sonnet-5-5 | 5 | 1,304 | 10 | 172,295 | 32 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 1,055 | 4 | 39,515 | 27 |
| review:bugs | claude-opus-5-5 | 9 | 963 | 18 | 413,276 | 70 |
| machine:bun run test -- "bun test scripts/tin-hi | claude-haiku-5-5 | 2 | 866 | 4 | 39,150 | 12 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 831 | 4 | 39,517 | 10 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 413 | 4 | 3,057 | 445 |
| machine:bun run test -- "cd apps/app && bun test | claude-haiku-5-5 | 2 | 355 | 4 | 39,153 | 10 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 300 | 4 | 36,049 | 264 |
| machine:cd apps/app && bun test ./test/tin-hieu- | claude-haiku-5-5 | 2 | 265 | 4 | 39,146 | 6 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 217 | 4 | 39,511 | 8 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 180 | 4 | 39,224 | 27 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 35,247 | 9 |
| review:conventions | claude-opus-5-5 | 6 | 141 | 12 | 242,615 | 32 |


wall: 1326s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 180 | 39,224 | 27 | 06:46:54 | 06:47:21 |
| machine | 10 | 7,994 | 317,727 | 1192 | 06:46:54 | 07:06:46 |
| ui | 1 | 3,860 | 604,245 | 139 | 06:46:54 | 06:49:13 |
| review | 3 | 5,579 | 1,665,728 | 152 | 06:46:54 | 06:49:25 |
| triage | 1 | 1,705 | 38,903 | 15 | 07:06:48 | 07:07:03 |
| refute | 1 | 1,304 | 172,295 | 32 | 07:07:06 | 07:07:38 |
| capture | 1 | 149 | 35,247 | 9 | 07:07:40 | 07:07:49 |
| synthesize | 1 | 9,397 | 121,643 | 67 | 07:07:52 | 07:09:00 |

- **claude-sonnet-5-5**: 6 agent · 21 calls · out 16,595 · in 42 · cache_read 1,011,557 · cache_create 366,893
- **claude-opus-5-5**: 3 agent · 30 calls · out 5,579 · in 60 · cache_read 1,665,728 · cache_create 221,671
- **claude-haiku-5-5**: 10 agent · 20 calls · out 7,994 · in 40 · cache_read 317,727 · cache_create 452,107

