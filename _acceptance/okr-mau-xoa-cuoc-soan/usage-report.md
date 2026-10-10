### S4 round 1 — wf_930bc642-17b (23 agent, 33,001 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 6,500 | 8 | 277,767 | 53 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 3,131 | 4 | 103,806 | 17 |
| triage | claude-sonnet-5-5 | 2 | 3,065 | 4 | 71,489 | 22 |
| review:measurement | claude-opus-5-5 | 5 | 2,798 | 10 | 406,266 | 57 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 6 | 2,451 | 12 | 428,694 | 32 |
| review:bugs | claude-opus-5-5 | 12 | 2,407 | 24 | 1,092,510 | 112 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,097 | 4 | 103,787 | 250 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 5 | 1,860 | 10 | 305,225 | 25 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,693 | 4 | 103,762 | 9 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,451 | 4 | 103,817 | 63 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 5 | 1,134 | 10 | 343,574 | 22 |
| refute:okr-mau-cuoc-soan.spec.ts | claude-sonnet-5-5 | 5 | 1,108 | 10 | 296,842 | 21 |
| review:conventions | claude-opus-5-5 | 14 | 848 | 28 | 1,281,841 | 74 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 526 | 4 | 103,778 | 235 |
| machine:bun _acceptance/okr-mau-xoa-cuoc-soan/ra | claude-haiku-5-5 | 2 | 337 | 4 | 103,806 | 37 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 314 | 4 | 73,086 | 26 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 270 | 4 | 68,780 | 233 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 255 | 4 | 103,806 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 242 | 4 | 103,806 | 10 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 175 | 4 | 103,760 | 18 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 167 | 4 | 103,756 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 67,573 | 6 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 26 | 4 | 103,804 | 11 |


wall: 938s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 314 | 73,086 | 26 | 22:55:56 | 22:56:22 |
| machine | 12 | 10,370 | 1,210,468 | 827 | 22:55:56 | 23:09:43 |
| judge | 3 | 5,445 | 1,077,493 | 34 | 22:55:56 | 22:56:30 |
| review | 3 | 6,053 | 2,780,617 | 113 | 22:55:56 | 22:57:50 |
| triage | 1 | 3,065 | 71,489 | 22 | 23:09:45 | 23:10:07 |
| refute | 1 | 1,108 | 296,842 | 21 | 23:10:09 | 23:10:31 |
| capture | 1 | 146 | 67,573 | 6 | 23:10:33 | 23:10:38 |
| synthesize | 1 | 6,500 | 277,767 | 53 | 23:10:41 | 23:11:34 |

- **claude-sonnet-5-5**: 8 agent · 31 calls · out 16,578 · in 62 · cache_read 1,864,250 · cache_create 607,832
- **claude-haiku-5-5**: 12 agent · 24 calls · out 10,370 · in 48 · cache_read 1,210,468 · cache_create 519,394
- **claude-opus-5-5**: 3 agent · 31 calls · out 6,053 · in 62 · cache_read 2,780,617 · cache_create 277,388

### S4 round 2 — wf_4f02f803-bb6 (21 agent, 34,238 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 5 | 5,940 | 10 | 373,481 | 47 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 7 | 4,246 | 14 | 510,688 | 47 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,076 | 4 | 103,776 | 26 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 2,712 | 4 | 103,822 | 17 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,296 | 4 | 103,833 | 67 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 2,101 | 4 | 103,803 | 256 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,833 | 4 | 103,778 | 10 |
| review:measurement | claude-opus-5-5 | 6 | 1,820 | 12 | 467,748 | 46 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,712 | 4 | 103,820 | 16 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,569 | 4 | 103,794 | 262 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,552 | 4 | 103,822 | 15 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 5 | 1,499 | 10 | 347,896 | 20 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,031 | 4 | 103,822 | 13 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 702 | 4 | 68,796 | 289 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 7 | 630 | 14 | 515,926 | 34 |
| machine:bun _acceptance/okr-mau-xoa-cuoc-soan/ra | claude-haiku-5-5 | 2 | 390 | 4 | 103,822 | 53 |
| review:bugs | claude-opus-5-5 | 6 | 373 | 12 | 465,138 | 29 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 299 | 4 | 73,102 | 27 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 168 | 4 | 103,772 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 151 | 4 | 67,589 | 6 |
| review:conventions | claude-opus-5-5 | 7 | 138 | 14 | 497,616 | 32 |


wall: 987s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 299 | 73,102 | 27 | 23:15:06 | 23:15:33 |
| machine | 12 | 19,142 | 1,210,660 | 928 | 23:15:06 | 23:30:34 |
| judge | 3 | 6,375 | 1,374,510 | 47 | 23:15:06 | 23:15:53 |
| review | 3 | 2,331 | 1,430,502 | 47 | 23:15:06 | 23:15:53 |
| capture | 1 | 151 | 67,589 | 6 | 23:30:37 | 23:30:44 |
| synthesize | 1 | 5,940 | 373,481 | 47 | 23:30:46 | 23:31:33 |

- **claude-sonnet-5-5**: 6 agent · 28 calls · out 12,765 · in 56 · cache_read 1,888,682 · cache_create 464,323
- **claude-haiku-5-5**: 12 agent · 24 calls · out 19,142 · in 48 · cache_read 1,210,660 · cache_create 530,790
- **claude-opus-5-5**: 3 agent · 19 calls · out 2,331 · in 38 · cache_read 1,430,502 · cache_create 223,434

