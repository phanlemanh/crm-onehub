### S4 round 1 — wf_84c5fe18-015 (25 agent, 50,213 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 2 | 11,937 | 4 | 63,621 | 70 |
| review:measurement | claude-opus-5-5 | 13 | 6,710 | 24 | 988,188 | 151 |
| triage | claude-sonnet-5-5 | 2 | 4,174 | 4 | 52,324 | 56 |
| review:bugs | claude-opus-5-5 | 14 | 2,392 | 26 | 896,957 | 127 |
| refute:man-loc.mjs | claude-sonnet-5-5 | 8 | 2,154 | 16 | 377,603 | 55 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,040 | 4 | 48,954 | 78 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,993 | 4 | 48,924 | 290 |
| ui:E8 | claude-sonnet-5-5 | 9 | 1,976 | 18 | 927,951 | 129 |
| refute:man-loc.mjs | claude-sonnet-5-5 | 8 | 1,941 | 15 | 417,389 | 52 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-5-5 | 2 | 1,776 | 4 | 48,748 | 71 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,568 | 4 | 3,034 | 421 |
| refute:man-loc.mjs | claude-sonnet-5-5 | 8 | 1,520 | 16 | 396,387 | 79 |
| review:conventions | claude-opus-5-5 | 11 | 1,446 | 22 | 607,632 | 74 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,411 | 4 | 48,899 | 13 |
| refute:man-loc.mjs | claude-sonnet-5-5 | 7 | 1,377 | 14 | 349,858 | 49 |
| refute:man-loc.mjs | claude-sonnet-5-5 | 5 | 1,187 | 10 | 215,222 | 59 |
| refute:data-table-tai-lai.dom.tsx | claude-sonnet-5-5 | 5 | 1,025 | 9 | 214,600 | 31 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-5-5 | 2 | 996 | 4 | 48,744 | 126 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 828 | 4 | 45,648 | 299 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 497 | 4 | 48,897 | 26 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 456 | 4 | 48,893 | 10 |
| machine:cd apps/app && bun test ./test/loc-don-v | claude-haiku-5-5 | 2 | 416 | 4 | 48,721 | 10 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 210 | 4 | 49,498 | 31 |
| capture:provenance | claude-sonnet-5-5 | 2 | 153 | 4 | 44,659 | 11 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 30 | 4 | 48,731 | 10 |


wall: 1385s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 210 | 49,498 | 31 | 12:34:17 | 12:34:49 |
| machine | 11 | 12,011 | 488,193 | 1154 | 12:34:17 | 12:53:32 |
| ui | 1 | 1,976 | 927,951 | 129 | 12:34:17 | 12:36:26 |
| review | 3 | 10,548 | 2,492,777 | 153 | 12:34:17 | 12:36:50 |
| triage | 1 | 4,174 | 52,324 | 56 | 12:53:34 | 12:54:30 |
| refute | 6 | 9,204 | 1,971,059 | 82 | 12:54:33 | 12:55:55 |
| capture | 1 | 153 | 44,659 | 11 | 12:55:57 | 12:56:08 |
| synthesize | 1 | 11,937 | 63,621 | 70 | 12:56:13 | 12:57:23 |

- **claude-sonnet-5-5**: 11 agent · 58 calls · out 27,654 · in 114 · cache_read 3,109,112 · cache_create 732,284
- **claude-opus-5-5**: 3 agent · 38 calls · out 10,548 · in 72 · cache_read 2,492,777 · cache_create 269,184
- **claude-haiku-5-5**: 11 agent · 22 calls · out 12,011 · in 44 · cache_read 488,193 · cache_create 593,083

### S4 round 2 — wf_c2d17585-6eb (17 agent, 30,481 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 9,219 | 12 | 377,583 | 94 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,452 | 4 | 48,754 | 33 |
| ui:E8 | claude-sonnet-5-5 | 11 | 2,495 | 22 | 1,174,723 | 120 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,015 | 4 | 48,811 | 78 |
| review:bugs | claude-opus-5-5 | 27 | 1,865 | 53 | 2,452,139 | 181 |
| triage | claude-sonnet-5-5 | 2 | 1,857 | 4 | 48,828 | 18 |
| review:measurement | claude-opus-5-5 | 9 | 1,624 | 17 | 585,739 | 92 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,549 | 4 | 3,034 | 405 |
| review:conventions | claude-opus-5-5 | 9 | 1,479 | 18 | 484,625 | 59 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,350 | 4 | 48,756 | 12 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,214 | 4 | 45,650 | 295 |
| machine:bun scripts/lan-do/tien-de.mjs --chay "b | claude-haiku-5-5 | 2 | 923 | 4 | 48,746 | 41 |
| machine:cd packages/ui && bun test --preload ./t | claude-haiku-5-5 | 2 | 496 | 4 | 48,733 | 10 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 358 | 4 | 48,781 | 289 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 278 | 4 | 48,750 | 9 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 161 | 4 | 48,329 | 26 |
| capture:provenance | claude-sonnet-5-5 | 2 | 146 | 4 | 44,516 | 15 |


wall: 1273s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 161 | 48,329 | 26 | 13:04:43 | 13:05:09 |
| machine | 9 | 11,635 | 390,015 | 1137 | 13:04:43 | 13:23:40 |
| ui | 1 | 2,495 | 1,174,723 | 120 | 13:04:43 | 13:06:43 |
| review | 3 | 4,968 | 3,522,503 | 182 | 13:04:43 | 13:07:45 |
| triage | 1 | 1,857 | 48,828 | 18 | 13:23:43 | 13:24:01 |
| capture | 1 | 146 | 44,516 | 15 | 13:24:04 | 13:24:19 |
| synthesize | 1 | 9,219 | 377,583 | 94 | 13:24:21 | 13:25:56 |

- **claude-sonnet-5-5**: 5 agent · 23 calls · out 13,878 · in 46 · cache_read 1,693,979 · cache_create 394,065
- **claude-haiku-5-5**: 9 agent · 18 calls · out 11,635 · in 36 · cache_read 390,015 · cache_create 493,714
- **claude-opus-5-5**: 3 agent · 45 calls · out 4,968 · in 88 · cache_read 3,522,503 · cache_create 279,249

