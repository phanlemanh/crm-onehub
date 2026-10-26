### S4 round 1 — wf_76769680-78d (21 agent, 38,720 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 7,985 | 6 | 90,595 | 46 |
| triage | claude-sonnet-5-5 | 2 | 4,493 | 4 | 28,985 | 32 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,597 | 4 | 26,905 | 31 |
| review:measurement | claude-opus-5-5 | 8 | 3,051 | 16 | 376,008 | 120 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,122 | 4 | 26,962 | 74 |
| review:bugs | claude-opus-5-5 | 16 | 1,963 | 32 | 861,008 | 128 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,912 | 4 | 26,932 | 307 |
| review:conventions | claude-opus-5-5 | 11 | 1,814 | 22 | 576,108 | 87 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,694 | 4 | 26,907 | 11 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,671 | 4 | 2,973 | 516 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,483 | 4 | 26,954 | 16 |
| machine:bun run test -- "cd apps/agent && bun te | claude-haiku-5-5 | 2 | 1,296 | 4 | 26,954 | 16 |
| refute:so-do.ts | claude-sonnet-5-5 | 7 | 1,157 | 14 | 214,131 | 25 |
| refute:so-do.ts | claude-sonnet-5-5 | 6 | 1,039 | 12 | 169,500 | 33 |
| refute:do.ts | claude-sonnet-5-5 | 3 | 1,016 | 6 | 63,565 | 15 |
| refute:do.ts | claude-sonnet-5-5 | 5 | 692 | 10 | 119,712 | 20 |
| machine:bun _acceptance/zalo-cau-thu-hai-lien-ke | claude-haiku-5-5 | 2 | 674 | 4 | 26,947 | 7 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 376 | 4 | 26,901 | 8 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 300 | 4 | 0 | 542 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 239 | 4 | 27,120 | 25 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 22,727 | 5 |


wall: 1620s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 239 | 27,120 | 25 | 17:30:24 | 17:30:48 |
| machine | 10 | 15,125 | 218,435 | 1497 | 17:30:24 | 17:55:21 |
| review | 3 | 6,828 | 1,813,124 | 130 | 17:30:24 | 17:32:33 |
| triage | 1 | 4,493 | 28,985 | 32 | 17:55:22 | 17:55:54 |
| refute | 4 | 3,904 | 566,908 | 34 | 17:55:55 | 17:56:30 |
| capture | 1 | 146 | 22,727 | 5 | 17:56:31 | 17:56:36 |
| synthesize | 1 | 7,985 | 90,595 | 46 | 17:56:37 | 17:57:23 |

- **claude-sonnet-5-5**: 8 agent · 30 calls · out 16,767 · in 60 · cache_read 736,335 · cache_create 302,011
- **claude-haiku-5-5**: 10 agent · 20 calls · out 15,125 · in 40 · cache_read 218,435 · cache_create 315,446
- **claude-opus-5-5**: 3 agent · 35 calls · out 6,828 · in 70 · cache_read 1,813,124 · cache_create 229,942

### S4 round 2 — wf_d6f7ad15-793 (15 agent, 24,396 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 6,955 | 8 | 148,689 | 50 |
| triage | claude-sonnet-5-5 | 2 | 2,861 | 4 | 27,340 | 23 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,037 | 4 | 26,977 | 73 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,864 | 4 | 26,947 | 293 |
| review:measurement | claude-opus-5-5 | 11 | 1,620 | 22 | 564,993 | 137 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,613 | 4 | 23,949 | 302 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,604 | 4 | 2,973 | 412 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,547 | 4 | 26,922 | 10 |
| review:bugs | claude-opus-5-5 | 16 | 1,435 | 32 | 965,839 | 169 |
| machine:bun _acceptance/zalo-cau-thu-hai-lien-ke | claude-haiku-5-5 | 2 | 1,019 | 4 | 26,962 | 8 |
| review:conventions | claude-opus-5-5 | 10 | 831 | 20 | 491,332 | 72 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 484 | 4 | 26,920 | 28 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 214 | 4 | 26,916 | 7 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 159 | 4 | 25,995 | 19 |
| capture:provenance | claude-sonnet-5-5 | 2 | 153 | 4 | 22,742 | 7 |


wall: 1214s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 159 | 25,995 | 19 | 22:03:50 | 22:04:09 |
| machine | 8 | 10,382 | 188,566 | 1131 | 22:03:50 | 22:22:41 |
| review | 3 | 3,886 | 2,022,164 | 171 | 22:03:50 | 22:06:41 |
| triage | 1 | 2,861 | 27,340 | 23 | 22:22:42 | 22:23:05 |
| capture | 1 | 153 | 22,742 | 7 | 22:23:06 | 22:23:12 |
| synthesize | 1 | 6,955 | 148,689 | 50 | 22:23:14 | 22:24:03 |

- **claude-sonnet-5-5**: 4 agent · 10 calls · out 10,128 · in 20 · cache_read 224,766 · cache_create 150,720
- **claude-haiku-5-5**: 8 agent · 16 calls · out 10,382 · in 32 · cache_read 188,566 · cache_create 239,681
- **claude-opus-5-5**: 3 agent · 37 calls · out 3,886 · in 74 · cache_read 2,022,164 · cache_create 254,572

