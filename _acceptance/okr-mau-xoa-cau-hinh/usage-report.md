### S4 round 1 — wf_ff9deb11-4e0 (28 agent, 33,585 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 8,030 | 8 | 284,600 | 61 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 2,948 | 4 | 104,725 | 23 |
| triage | claude-sonnet-5-5 | 2 | 2,627 | 4 | 71,082 | 20 |
| review:conventions | claude-opus-5-5 | 11 | 2,405 | 22 | 1,082,094 | 97 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,966 | 4 | 103,775 | 10 |
| review:measurement | claude-opus-5-5 | 9 | 1,561 | 18 | 791,348 | 100 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,485 | 4 | 104,722 | 20 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,390 | 4 | 103,775 | 306 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,309 | 4 | 104,725 | 19 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 5 | 1,245 | 10 | 383,800 | 23 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 7 | 937 | 14 | 598,443 | 28 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 922 | 4 | 103,773 | 40 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 805 | 4 | 104,724 | 18 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 5 | 678 | 10 | 343,968 | 23 |
| machine:bun _acceptance/okr-mau-xoa-cau-hinh/ran | claude-haiku-5-5 | 2 | 672 | 4 | 104,724 | 86 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 639 | 4 | 104,725 | 17 |
| refute:setup.md | claude-sonnet-5-5 | 3 | 620 | 6 | 144,353 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 592 | 4 | 104,722 | 17 |
| machine:bun _acceptance/okr-mau-xoa-cuoc-soan/ra | claude-haiku-5-5 | 2 | 582 | 4 | 104,726 | 59 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 436 | 4 | 103,791 | 259 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 405 | 4 | 76,228 | 93 |
| review:bugs | claude-opus-5-5 | 17 | 283 | 34 | 1,842,350 | 139 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 273 | 4 | 103,830 | 63 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 244 | 4 | 103,800 | 243 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 195 | 4 | 104,715 | 23 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 188 | 4 | 103,769 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 67,586 | 6 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 1 | 2 | 2 | 34,982 | 205 |


wall: 1386s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 405 | 76,228 | 93 | 23:30:42 | 23:32:15 |
| machine | 17 | 14,648 | 1,704,003 | 1284 | 23:30:42 | 23:52:06 |
| judge | 3 | 2,860 | 1,326,211 | 31 | 23:30:42 | 23:31:13 |
| review | 3 | 4,249 | 3,715,792 | 140 | 23:30:42 | 23:33:02 |
| triage | 1 | 2,627 | 71,082 | 20 | 23:52:07 | 23:52:27 |
| refute | 1 | 620 | 144,353 | 11 | 23:52:28 | 23:52:39 |
| capture | 1 | 146 | 67,586 | 6 | 23:52:40 | 23:52:46 |
| synthesize | 1 | 8,030 | 284,600 | 61 | 23:52:47 | 23:53:48 |

- **claude-sonnet-5-5**: 8 agent · 30 calls · out 14,688 · in 60 · cache_read 1,970,060 · cache_create 668,923
- **claude-haiku-5-5**: 17 agent · 33 calls · out 14,648 · in 66 · cache_read 1,704,003 · cache_create 784,849
- **claude-opus-5-5**: 3 agent · 37 calls · out 4,249 · in 74 · cache_read 3,715,792 · cache_create 303,483

