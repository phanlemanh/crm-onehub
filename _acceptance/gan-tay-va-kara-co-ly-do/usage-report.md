### S4 round 1 — wf_9ecff45d-c2b (36 agent, 115,354 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| review:bugs | claude-opus-5-5 | 42 | 23,752 | 84 | 4,020,951 | 311 |
| review:measurement | claude-opus-5-5 | 21 | 18,562 | 42 | 2,003,864 | 234 |
| review:conventions | claude-opus-5-5 | 20 | 15,599 | 40 | 1,567,456 | 188 |
| synthesize:report | claude-sonnet-5-5 | 3 | 14,861 | 6 | 148,102 | 87 |
| ui:E12 | claude-sonnet-5-5 | 10 | 6,732 | 20 | 1,026,947 | 298 |
| triage | claude-sonnet-5-5 | 2 | 6,169 | 4 | 45,995 | 43 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 2,286 | 4 | 41,516 | 45 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,267 | 4 | 41,802 | 12 |
| refute:okr-gan-ly-do.spec.ts | claude-sonnet-5-5 | 5 | 2,054 | 10 | 198,375 | 25 |
| refute:okr-gan-ly-do.spec.ts | claude-sonnet-5-5 | 5 | 1,942 | 10 | 179,355 | 25 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,856 | 4 | 41,500 | 16 |
| refute:gan-ly-do.dom.tsx | claude-sonnet-5-5 | 3 | 1,520 | 6 | 88,695 | 16 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-5-5 | 2 | 1,439 | 4 | 41,575 | 25 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 1,080 | 4 | 41,827 | 229 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,026 | 4 | 41,501 | 16 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,023 | 4 | 41,501 | 17 |
| machine:bun _acceptance/gan-tay-va-kara-co-ly-do | claude-haiku-5-5 | 2 | 970 | 4 | 5,738 | 406 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 951 | 4 | 41,818 | 296 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 941 | 4 | 41,495 | 13 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 871 | 4 | 41,567 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 859 | 4 | 41,495 | 17 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 789 | 4 | 41,551 | 11 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 787 | 4 | 41,857 | 67 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 783 | 4 | 41,800 | 24 |
| machine:node _acceptance/gan-tay-va-kara-co-ly-d | claude-haiku-5-5 | 2 | 721 | 4 | 41,498 | 7 |
| baseline:diffBase | claude-sonnet-5-5 | 2 | 675 | 4 | 48,918 | 58 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 670 | 4 | 41,457 | 305 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 646 | 4 | 41,796 | 8 |
| machine:cd packages/validation && bun test test/ | claude-haiku-5-5 | 2 | 612 | 4 | 41,484 | 9 |
| capture:provenance | claude-sonnet-5-5 | 2 | 489 | 4 | 37,723 | 9 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 2 | 477 | 4 | 41,718 | 7 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 2 | 450 | 4 | 41,720 | 6 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 443 | 4 | 41,496 | 16 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 2 | 412 | 4 | 38,356 | 6 |
| machine:bun _acceptance/gan-tay-va-kara-co-ly-do | claude-haiku-5-5 | 2 | 412 | 4 | 41,498 | 68 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 228 | 4 | 41,552 | 11 |


wall: 1107s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| baseline | 1 | 675 | 48,918 | 58 | 02:16:55 | 02:17:52 |
| machine | 22 | 21,660 | 879,324 | 941 | 02:16:55 | 02:32:36 |
| ui | 1 | 6,732 | 1,026,947 | 298 | 02:17:13 | 02:22:11 |
| judge | 3 | 1,339 | 121,794 | 13 | 02:17:14 | 02:17:26 |
| review | 3 | 57,913 | 7,592,271 | 312 | 02:17:20 | 02:22:32 |
| triage | 1 | 6,169 | 45,995 | 43 | 02:32:36 | 02:33:18 |
| refute | 3 | 5,516 | 466,425 | 27 | 02:33:18 | 02:33:46 |
| capture | 1 | 489 | 37,723 | 9 | 02:33:46 | 02:33:55 |
| synthesize | 1 | 14,861 | 148,102 | 87 | 02:33:55 | 02:35:22 |

- **claude-opus-5-5**: 3 agent · 83 calls · out 57,913 · in 166 · cache_read 7,592,271 · cache_create 377,269
- **claude-sonnet-5-5**: 11 agent · 38 calls · out 35,781 · in 76 · cache_read 1,895,904 · cache_create 666,950
- **claude-haiku-5-5**: 22 agent · 44 calls · out 21,660 · in 88 · cache_read 879,324 · cache_create 956,303

### S4 round 2 — wf_f7c9d9d5-e81 (27 agent, 46,237 out-tok)

| label | model | calls | out | in | cache_read | s |
|---|---|--:|--:|--:|--:|--:|
| synthesize:report | claude-sonnet-5-5 | 6 | 12,747 | 12 | 360,828 | 86 |
| review:bugs | claude-opus-5-5 | 16 | 7,060 | 32 | 937,339 | 103 |
| review:measurement | claude-opus-5-5 | 8 | 4,056 | 16 | 381,357 | 55 |
| machine:bunx turbo run lint --force | claude-haiku-5-5 | 2 | 2,168 | 4 | 41,426 | 12 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,802 | 4 | 41,469 | 21 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,313 | 4 | 41,485 | 37 |
| machine:bun run test -- --filter=agent-okr --fil | claude-haiku-5-5 | 2 | 1,292 | 4 | 41,481 | 74 |
| review:conventions | claude-opus-5-5 | 4 | 1,176 | 8 | 133,329 | 18 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 1,149 | 4 | 41,536 | 13 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 1,039 | 4 | 41,464 | 19 |
| triage | claude-sonnet-5-5 | 2 | 934 | 4 | 39,621 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 904 | 4 | 41,470 | 19 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 889 | 4 | 41,521 | 10 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 883 | 4 | 41,465 | 19 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 866 | 4 | 41,464 | 19 |
| machine:bun run test -- --filter=app --filter=@c | claude-haiku-5-5 | 2 | 832 | 4 | 41,442 | 284 |
| machine:cd apps/app && TZ=Asia/Ho_Chi_Minh bun t | claude-haiku-5-5 | 2 | 820 | 4 | 41,520 | 11 |
| machine:bun run test -- "cd apps/api && bun test | claude-haiku-5-5 | 2 | 818 | 4 | 41,470 | 18 |
| machine:bun run test -- --filter=api | claude-haiku-5-5 | 2 | 811 | 4 | 41,426 | 261 |
| machine:bunx turbo run build --force | claude-haiku-5-5 | 2 | 806 | 4 | 41,424 | 24 |
| machine:bun run test -- --filter=agent --filter= | claude-haiku-5-5 | 2 | 803 | 4 | 41,451 | 230 |
| machine:bun run lint:slop | claude-haiku-5-5 | 2 | 709 | 4 | 41,420 | 9 |
| machine:bun run test -- "cd apps/agent && CRM_TE | claude-haiku-5-5 | 2 | 583 | 4 | 41,544 | 29 |
| judge:E8:spec-alignment | claude-sonnet-5-5 | 2 | 501 | 4 | 41,687 | 7 |
| judge:E8:domain-correctness | claude-sonnet-5-5 | 2 | 478 | 4 | 38,325 | 6 |
| capture:provenance | claude-sonnet-5-5 | 2 | 403 | 4 | 37,347 | 8 |
| judge:E8:operational-feasibility | claude-sonnet-5-5 | 2 | 395 | 4 | 41,689 | 7 |


wall: 1000s

| vai tro | agents | out | cache_read | wall s | bat dau | ket thuc |
|---|--:|--:|--:|--:|---|---|
| machine | 18 | 18,487 | 746,478 | 895 | 02:37:22 | 02:52:17 |
| judge | 3 | 1,374 | 121,701 | 10 | 02:37:34 | 02:37:44 |
| review | 3 | 12,292 | 1,452,025 | 104 | 02:37:41 | 02:39:25 |
| triage | 1 | 934 | 39,621 | 10 | 02:52:17 | 02:52:28 |
| capture | 1 | 403 | 37,347 | 8 | 02:52:28 | 02:52:36 |
| synthesize | 1 | 12,747 | 360,828 | 86 | 02:52:36 | 02:54:03 |

- **claude-sonnet-5-5**: 6 agent · 16 calls · out 15,458 · in 32 · cache_read 559,497 · cache_create 325,756
- **claude-opus-5-5**: 3 agent · 28 calls · out 12,292 · in 56 · cache_read 1,452,025 · cache_create 196,891
- **claude-haiku-5-5**: 18 agent · 36 calls · out 18,487 · in 72 · cache_read 746,478 · cache_create 754,134

