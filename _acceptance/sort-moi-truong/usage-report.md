### S4 round 1 — wf_c5aafb19-8f3 (32 agent, 57,608 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 3 | 13,013 | 6 | 123,995 | 77 |
| review:measurement | claude-opus-5-5 | 23 | 12,338 | 46 | 2,004,200 | 347 |
| triage | claude-sonnet-5-5 | 2 | 4,045 | 4 | 33,561 | 28 |
| ui:E9 | claude-sonnet-5-5 | 13 | 3,882 | 26 | 1,377,183 | 109 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,046 | 4 | 30,266 | 75 |
| review:conventions | claude-opus-5-5 | 20 | 2,029 | 40 | 1,459,909 | 173 |
| review:bugs | claude-opus-5-5 | 25 | 1,890 | 50 | 1,626,358 | 204 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,761 | 4 | 30,232 | 19 |
| refute:sort-moi-truong.spec.ts | claude-sonnet-5-5 | 5 | 1,542 | 10 | 129,540 | 29 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 1,447 | 4 | 2,973 | 428 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,350 | 4 | 30,211 | 11 |
| refute:sort-moi-truong.spec.ts | claude-sonnet-5-5 | 5 | 1,346 | 10 | 136,023 | 24 |
| refute:sort-moi-truong.spec.ts | claude-sonnet-5-5 | 5 | 1,336 | 10 | 136,513 | 28 |
| refute:sort-moi-truong.dom.tsx | claude-sonnet-5-5 | 12 | 1,160 | 24 | 380,625 | 45 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 965 | 4 | 30,235 | 16 |
| refute:do-man.mjs | claude-sonnet-5-5 | 3 | 885 | 6 | 62,730 | 16 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 775 | 4 | 30,236 | 309 |
| refute:do-man.mjs | claude-sonnet-5-5 | 3 | 731 | 6 | 56,457 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 597 | 4 | 30,231 | 15 |
| machine:bun run test -- "cd apps/api && SMT_TOC_ | claude-haiku-5-5 | 2 | 527 | 4 | 30,263 | 20 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 487 | 4 | 30,209 | 25 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 480 | 4 | 35,106 | 45 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 407 | 4 | 30,231 | 15 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 407 | 4 | 30,289 | 10 |
| machine:bun _acceptance/sort-moi-truong/rang/que | claude-haiku-5-5 | 2 | 370 | 4 | 30,226 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 361 | 4 | 30,292 | 9 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 297 | 4 | 2,973 | 322 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 292 | 4 | 30,205 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 289 | 4 | 30,289 | 8 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 224 | 4 | 30,232 | 14 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 179 | 4 | 30,236 | 13 |
| capture:provenance | claude-sonnet-5-5 | 2 | 150 | 4 | 26,029 | 6 |


wall: 1358s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 480 | 35,106 | 45 | 05:23:40 | 05:24:25 |
| machine | 18 | 12,781 | 489,829 | 1191 | 05:23:40 | 05:43:31 |
| ui | 1 | 3,882 | 1,377,183 | 109 | 05:23:40 | 05:25:29 |
| review | 3 | 16,257 | 5,090,467 | 362 | 05:23:40 | 05:29:42 |
| triage | 1 | 4,045 | 33,561 | 28 | 05:43:33 | 05:44:02 |
| refute | 6 | 7,000 | 901,888 | 46 | 05:44:04 | 05:44:50 |
| capture | 1 | 150 | 26,029 | 6 | 05:44:52 | 05:44:58 |
| synthesize | 1 | 13,013 | 123,995 | 77 | 05:45:01 | 05:46:18 |

- **claude-sonnet-5-5**: 11 agent · 55 calls · out 28,570 · in 110 · cache_read 2,497,762 · cache_create 522,489
- **claude-opus-5-5**: 3 agent · 68 calls · out 16,257 · in 136 · cache_read 5,090,467 · cache_create 305,445
- **claude-haiku-5-5**: 18 agent · 36 calls · out 12,781 · in 72 · cache_read 489,829 · cache_create 585,414

### S4 round 2 — wf_3740701a-026 (27 agent, 37,378 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 4 | 11,062 | 8 | 184,469 | 79 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 3,495 | 4 | 30,495 | 31 |
| review:bugs | claude-opus-5-5 | 40 | 2,605 | 80 | 2,965,597 | 306 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 2,065 | 4 | 30,552 | 74 |
| review:measurement | claude-opus-5-5 | 13 | 1,908 | 26 | 794,100 | 139 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,794 | 4 | 30,522 | 314 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 1,598 | 4 | 0 | 356 |
| triage | claude-sonnet-5-5 | 2 | 1,586 | 4 | 30,202 | 14 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 1,458 | 4 | 30,497 | 11 |
| refute:sort-moi-truong.spec.ts | claude-sonnet-5-5 | 5 | 1,277 | 10 | 141,655 | 30 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,164 | 4 | 30,247 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,049 | 4 | 30,252 | 18 |
| ui:E9 | claude-sonnet-5-5 | 5 | 887 | 10 | 432,148 | 65 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 875 | 4 | 30,251 | 15 |
| refute:sort-moi-truong.spec.ts | claude-sonnet-5-5 | 6 | 723 | 12 | 180,057 | 24 |
| review:conventions | claude-opus-5-5 | 7 | 675 | 14 | 262,796 | 47 |
| machine:bun _acceptance/sort-moi-truong/rang/que | claude-haiku-5-5 | 2 | 520 | 4 | 30,242 | 10 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 461 | 4 | 30,305 | 11 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 442 | 4 | 34,535 | 43 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 442 | 4 | 30,248 | 15 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 435 | 4 | 2,973 | 420 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 228 | 4 | 30,305 | 9 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 226 | 4 | 30,308 | 11 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 215 | 4 | 30,491 | 7 |
| capture:provenance | claude-sonnet-5-5 | 2 | 149 | 4 | 26,315 | 7 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 32 | 4 | 30,248 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 7 | 4 | 30,247 | 16 |


wall: 1375s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 442 | 34,535 | 43 | 05:53:57 | 05:54:40 |
| machine | 17 | 16,064 | 458,183 | 1235 | 05:53:57 | 06:14:32 |
| ui | 1 | 887 | 432,148 | 65 | 05:53:57 | 05:55:02 |
| review | 3 | 5,188 | 4,022,493 | 309 | 05:53:57 | 05:59:07 |
| triage | 1 | 1,586 | 30,202 | 14 | 06:14:35 | 06:14:49 |
| refute | 2 | 2,000 | 321,712 | 30 | 06:14:51 | 06:15:21 |
| capture | 1 | 149 | 26,315 | 7 | 06:15:23 | 06:15:30 |
| synthesize | 1 | 11,062 | 184,469 | 79 | 06:15:32 | 06:16:52 |

- **claude-sonnet-5-5**: 7 agent · 26 calls · out 16,126 · in 52 · cache_read 1,029,381 · cache_create 398,107
- **claude-haiku-5-5**: 17 agent · 34 calls · out 16,064 · in 68 · cache_read 458,183 · cache_create 561,014
- **claude-opus-5-5**: 3 agent · 60 calls · out 5,188 · in 120 · cache_read 4,022,493 · cache_create 242,097

